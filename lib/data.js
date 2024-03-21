import prisma from '@/lib/prisma'

export async function getPlans() {
  // Gets all active plans
  return await prisma.plan.findMany({
    where: {
      NOT: {
        status: 'draft'
      }
    }
  })
}


export async function getPlan(userId) {
  // Gets single active plan by ID
  return await prisma.plan.findFirst({
    where: {
      userId: userId,
      status: 'active'
    }
  })
}


export async function getSubscription(userId) {
  // Gets the most recent subscription
  return await prisma.subscription.findFirst({
    where: {
      userId: userId
    },
    include: {
      plan: true
    },
    orderBy: {
      lemonSqueezyId: 'desc'
    }
  })
}