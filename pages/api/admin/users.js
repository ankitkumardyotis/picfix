import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const planFilter = req.query.plan || '';
        
        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build search conditions
        const searchConditions = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        // Get all unique plans for the filter dropdown
        const allPlans = await prisma.plan.findMany({
            select: {
                planName: true
            },
            distinct: ['planName']
        });
        const uniquePlans = allPlans.map(plan => plan.planName).sort();

        // Build plan filter conditions
        let planFilterConditions = {};
        if (planFilter) {
            // First get user IDs that have the specified plan
            const usersWithPlan = await prisma.plan.findMany({
                where: {
                    planName: planFilter
                },
                select: {
                    userId: true
                }
            });
            const userIdsWithPlan = usersWithPlan.map(p => p.userId);
            
            if (userIdsWithPlan.length > 0) {
                planFilterConditions = {
                    id: { in: userIdsWithPlan }
                };
            } else {
                // If no users found with this plan, return empty result
                planFilterConditions = {
                    id: { in: [] }
                };
            }
        }

        // Combine search and plan filter conditions
        const whereConditions = {
            ...searchConditions,
            ...planFilterConditions
        };

        // Get total count for pagination
        const totalUsers = await prisma.user.count({
            where: whereConditions
        });

        // Fetch this page of users. Their activity is counted by the database below, instead of
        // loading every history row of every user on the page.
        const users = await prisma.user.findMany({
            where: whereConditions,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                emailVerified: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: offset,
            take: limit
        });

        const userIds = users.map(user => user.id);

        const [plans, payments, historyStats, completedStats, publishedStats] = await Promise.all([
            // Plan data for these users
            prisma.plan.findMany({
                where: {
                    userId: { in: userIds }
                }
            }),
            // Payment history for the total spent calculation
            prisma.paymentHistory.findMany({
                where: {
                    userId: { in: userIds },
                    paymentStatus: 'captured'
                },
                select: {
                    userId: true,
                    amount: true,
                    createdAt: true
                }
            }),
            // All activity: how many history rows, and the latest one, per user
            prisma.history.groupBy({
                by: ['userId'],
                where: { userId: { in: userIds } },
                _count: { _all: true },
                _max: { createdAt: true }
            }),
            // Completed images: how many, and the latest one, per user
            prisma.history.groupBy({
                by: ['userId'],
                where: { userId: { in: userIds }, status: 'completed' },
                _count: { _all: true },
                _max: { createdAt: true }
            }),
            // Published images per user
            prisma.publishedImage.groupBy({
                by: ['userId'],
                where: { userId: { in: userIds } },
                _count: { _all: true }
            })
        ]);

        const indexByUser = (rows) => new Map(rows.map(row => [row.userId, row]));
        const historyByUser = indexByUser(historyStats);
        const completedByUser = indexByUser(completedStats);
        const publishedByUser = indexByUser(publishedStats);

        // Transform data to include plan info and statistics
        const transformedUsers = users.map(user => {
            const userPlan = plans.find(plan => plan.userId === user.id);
            const userPayments = payments.filter(payment => payment.userId === user.id);
            const totalSpent = userPayments.reduce((sum, payment) => sum + payment.amount, 0);

            const activity = historyByUser.get(user.id);
            const completed = completedByUser.get(user.id);
            const lastActivity = activity ? activity._max.createdAt : null;
            const lastImageGeneration = completed ? completed._max.createdAt : null;

            // Determine user status based on recent activity
            const recentActivity = lastActivity
                ? new Date() - new Date(lastActivity) < 30 * 24 * 60 * 60 * 1000
                : false;

            return {
                id: user.id,
                name: user.name || 'Anonymous User',
                email: user.email,
                image: user.image,
                joinDate: user.createdAt,
                lastActive: lastActivity || user.createdAt,
                lastImageGeneration: lastImageGeneration,
                status: recentActivity ? 'Active' : 'Inactive',
                // Plan information
                plan: userPlan ? {
                    name: userPlan.planName,
                    credits: userPlan.creditPoints,
                    remainingCredits: userPlan.remainingPoints,
                    usedCredits: userPlan.creditPoints - userPlan.remainingPoints,
                    renewalDate: userPlan.expiredAt
                } : {
                    name: 'Free',
                    credits: 0,
                    remainingCredits: 0,
                    usedCredits: 0,
                    renewalDate: null
                },
                // Statistics
                totalSpent: totalSpent,
                imagesProcessed: completed ? completed._count._all : 0,
                publishedImages: publishedByUser.has(user.id) ? publishedByUser.get(user.id)._count._all : 0,
                totalHistory: activity ? activity._count._all : 0
            };
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({ 
            success: true,
            users: transformedUsers,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalUsers: totalUsers,
                limit: limit,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage
            },
            availablePlans: uniquePlans
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withAdminAuth(handler);
