import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get date range for analytics (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // 1. Basic statistics
        const [
            totalUsers,
            totalRevenue,
            totalImages,
            totalPublishedImages
        ] = await Promise.all([
            prisma.user.count(),
            prisma.paymentHistory.aggregate({
                where: { paymentStatus: 'completed' },
                _sum: { amount: true }
            }),
            prisma.history.count({
                where: { status: 'completed' }
            }),
            prisma.publishedImage.count()
        ]);

        // 2. User growth data (last 6 months) - MongoDB compatible
        const allUsers = await prisma.user.findMany({
            select: {
                createdAt: true,
                history: {
                    select: {
                        createdAt: true
                    },
                    where: {
                        createdAt: { gte: sixMonthsAgo }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        // Generate last 6 months
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date);
        }

        // Calculate cumulative users and active users for each month
        const userGrowthData = months.map(monthDate => {
            const monthKey = monthDate.toISOString().substring(0, 7); // YYYY-MM format
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

            // Count total users up to this month
            const totalUsersCount = allUsers.filter(user =>
                new Date(user.createdAt) <= new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
            ).length;

            // Count active users in this month (users with history in this month)
            const activeUsersCount = allUsers.filter(user =>
                user.history && user.history.some(h => {
                    const historyMonth = new Date(h.createdAt).toISOString().substring(0, 7);
                    return historyMonth === monthKey;
                })
            ).length;

            return {
                month: monthName,
                users: totalUsersCount,
                activeUsers: activeUsersCount
            };
        });


        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await prisma.user.count({
            where: {
                history: {
                    some: {
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }
            }
        });

        // 4. Feature usage statistics
        const featureUsage = await prisma.history.groupBy({
            by: ['model'],
            where: {
                status: 'completed',
                createdAt: { gte: sixMonthsAgo }
            },
            _count: {
                model: true
            },
            orderBy: {
                _count: {
                    model: 'desc'
                }
            }
        });

        // 5. Plan distribution
        const planDistribution = await prisma.plan.groupBy({
            by: ['planName'],
            _count: {
                planName: true
            }
        });

        // 6. Revenue by plan
        const revenueByPlan = await prisma.paymentHistory.groupBy({
            by: ['planName'],
            where: { paymentStatus: 'captured' || 'payment_success' },
            _sum: { amount: true },
            _count: { planName: true }
        });

        const recentPayments = await prisma.paymentHistory.findMany({
            where: {
                paymentStatus: 'captured' || 'payment_success',
                createdAt: { gte: sixMonthsAgo }
            },
            select: {
                createdAt: true,
                amount: true
            }
        });

        // Group payments by month
        const monthlyRevenue = [];
        const revenueMap = new Map();

        recentPayments.forEach(payment => {
            const monthKey = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM format
            const existing = revenueMap.get(monthKey) || { revenue: 0, transactions: 0 };
            existing.revenue += payment.amount;
            existing.transactions += 1;
            revenueMap.set(monthKey, existing);
        });

        // Convert to array and sort
        for (let [month, data] of revenueMap.entries()) {
            monthlyRevenue.push({ month, revenue: data.revenue, transactions: data.transactions });
        }
        monthlyRevenue.sort((a, b) => a.month.localeCompare(b.month));

        // 8. Today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [todayUsers, todayImages, todayRevenue] = await Promise.all([
            prisma.user.count({
                where: { createdAt: { gte: today, lt: tomorrow } }
            }),
            prisma.history.count({
                where: {
                    status: 'completed',
                    createdAt: { gte: today, lt: tomorrow }
                }
            }),
            prisma.paymentHistory.aggregate({
                where: {
                    paymentStatus: 'captured' || 'payment_success',
                    createdAt: { gte: today, lt: tomorrow }
                },
                _sum: { amount: true }
            })
        ]);

        // Transform and calculate additional metrics
        const totalRevenueAmount = totalRevenue._sum.amount || 0;
        const todayRevenueAmount = todayRevenue._sum.amount || 0;

        // Calculate conversion rate (users with at least one payment) - MongoDB compatible
        const distinctPayingUsers = await prisma.paymentHistory.findMany({
            where: { paymentStatus: 'captured' || 'payment_success' },
            select: { userId: true },
            distinct: ['userId']
        });
        const usersWithPayments = distinctPayingUsers.length;

        const conversionRate = totalUsers > 0 ? ((usersWithPayments / totalUsers) * 100) : 0;

        // Calculate average credits per user
        const avgCreditsResult = await prisma.plan.aggregate({
            _avg: { creditPoints: true }
        });
        const avgCreditsPerUser = avgCreditsResult._avg.creditPoints || 0;

        // Format feature usage data
        const totalFeatureUsage = featureUsage.reduce((sum, item) => sum + item._count.model, 0);
        const formattedFeatureUsage = featureUsage.slice(0, 10).map(item => ({
            feature: item.model.charAt(0).toUpperCase() + item.model.slice(1).replace(/-/g, ' '),
            usage: totalFeatureUsage > 0 ? ((item._count.model / totalFeatureUsage) * 100).toFixed(1) : 0,
            count: item._count.model,
            color: getColorForFeature(item.model)
        }));

        // Format plan distribution
        const totalPlans = planDistribution.reduce((sum, item) => sum + item._count.planName, 0);
        const formattedPlanDistribution = planDistribution.map(item => ({
            plan: item.planName,
            count: item._count.planName,
            percentage: totalPlans > 0 ? ((item._count.planName / totalPlans) * 100).toFixed(1) : 0,
            color: getColorForPlan(item.planName)
        }));

        // Format revenue by plan
        const formattedRevenueByPlan = revenueByPlan.map(item => ({
            plan: item.planName,
            revenue: item._sum.amount || 0,
            transactions: item._count.planName,
            color: getColorForPlan(item.planName)
        }));

        res.status(200).json({
            success: true,
            overview: {
                totalUsers,
                activeUsers,
                totalRevenue: totalRevenueAmount,
                totalImages,
                totalPublishedImages,
                todayUsers,
                todayImages,
                todayRevenue: todayRevenueAmount,
                conversionRate: parseFloat(conversionRate.toFixed(2)),
                avgCreditsPerUser: Math.round(avgCreditsPerUser)
            },
            userGrowth: userGrowthData,
            featureUsage: formattedFeatureUsage,
            planDistribution: formattedPlanDistribution,
            revenueByPlan: formattedRevenueByPlan,
            monthlyRevenue: monthlyRevenue || []
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withAdminAuth(handler);

// Helper functions for colors
function getColorForFeature(feature) {
    const colors = {
        'background-removal': '#3a1c71',
        'image-enhancement': '#d76d77',
        'object-removal': '#ffaf7b',
        'image-restoration': '#10b981',
        'room-design': '#8b5cf6',
        'combine-image': '#06b6d4',
        'trendy-look': '#f59e0b',
        're-imagine': '#ef4444'
    };
    return colors[feature] || '#6b7280';
}

function getColorForPlan(plan) {
    const colors = {
        'Premium': '#3a1c71',
        'Pro': '#d76d77',
        'Basic': '#6b7280',
        'Free': '#9ca3af'
    };
    return colors[plan] || '#6b7280';
}
