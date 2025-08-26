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
        
        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build search conditions
        const searchConditions = search ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        // Get total count for pagination
        const totalUsers = await prisma.user.count({
            where: searchConditions
        });

        // Fetch users with their plan data and statistics
        const users = await prisma.user.findMany({
            where: searchConditions,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                emailVerified: true,
                // Get plan information
                history: {
                    select: {
                        id: true,
                        model: true,
                        status: true,
                        createdAt: true
                    }
                },
                // Get published images count
                publishedImages: {
                    select: {
                        id: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: offset,
            take: limit
        });

        // Get plan data for all users
        const userIds = users.map(user => user.id);
        const plans = await prisma.plan.findMany({
            where: {
                userId: { in: userIds }
            }
        });

        // Get payment history for total spent calculation
        const payments = await prisma.paymentHistory.findMany({
            where: {
                userId: { in: userIds },
                paymentStatus: 'completed'
            },
            select: {
                userId: true,
                amount: true,
                createdAt: true
            }
        });

        // Transform data to include plan info and statistics
        const transformedUsers = users.map(user => {
            const userPlan = plans.find(plan => plan.userId === user.id);
            const userPayments = payments.filter(payment => payment.userId === user.id);
            const totalSpent = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
            const completedImages = user.history.filter(h => h.status === 'completed').length;
            
            // Determine user status based on recent activity
            const recentActivity = user.history.length > 0 ? 
                new Date() - new Date(user.history[0].createdAt) < 30 * 24 * 60 * 60 * 1000 : false;
            
            return {
                id: user.id,
                name: user.name || 'Anonymous User',
                email: user.email,
                image: user.image,
                joinDate: user.createdAt,
                lastActive: user.history.length > 0 ? user.history[0].createdAt : user.createdAt,
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
                imagesProcessed: completedImages,
                publishedImages: user.publishedImages.length,
                totalHistory: user.history.length
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
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withAdminAuth(handler);
