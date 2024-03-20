import prisma from '@/lib/prisma'

// import prisma from "@/pages/api/_lib/prisma";



// update the plans
export async function updatePlan(planId, userId) {
  const saveCreditPoint = await prisma.plan.update({
    where: {
      id: planData[0].id, // Assuming you only have one plan per user
      userId: session.user.id
    },
    data: {
      remainingPoints: {
        decrement: 1
      }
    },
  }).catch(err => {
    console.error('Error creating Plan:', err);
  })
  return saveCreditPoint
}


export async function createHistory(data) {
  // Gets single active plan by ID
  const createHistory = await prisma.history.create({
    data: data
  }).catch(err => {
    console.error('Error creating Plan:', err);
  });
  return createHistory

}
// Take refrence for data to create history
// {
//   userId: session.user.id,
//   model: jsonFinalResponse.model,
//   status: jsonFinalResponse.status,
//   createdAt: jsonFinalResponse.created_at,
//   replicateId: jsonFinalResponse.id
// }

export async function getUserPlan(userId) {
  // Gets single active plan by ID
  let planData = await prisma.plan.findMany({
    where: {
      userId: userId,
    }
  }).catch(err => {
    console.error('Error creating Plan:', err);
  });
  return planData
}

