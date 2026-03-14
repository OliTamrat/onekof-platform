import { prisma } from '@onekof/database';

/**
 * Calculate project progress based on task completion
 * Progress = (Number of DONE tasks / Total tasks) * 100
 */
export async function calculateProjectProgress(projectId: string): Promise<number> {
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: {
      status: true,
    },
  });

  if (tasks.length === 0) return 0;

  const doneTasks = tasks.filter(task => task.status === 'DONE').length;
  const progress = Math.round((doneTasks / tasks.length) * 100);

  return progress;
}

/**
 * Calculate goal progress based on:
 * 1. Key results completion
 * 2. Linked projects (project -> goal links with contribution weights)
 */
export async function calculateGoalProgress(goalId: string): Promise<number> {
  const keyResults = await prisma.keyResult.findMany({
    where: {
      goalId,
    },
  });

  if (keyResults.length > 0) {
    let totalProgress = 0;

    for (const kr of keyResults) {
      const krProgress = (kr.current / kr.target) * 100;
      totalProgress += Math.min(krProgress, 100);
    }

    return Math.round(totalProgress / keyResults.length);
  }

  // Calculate from linked projects
  const projectLinks = await prisma.goalProject.findMany({
    where: { goalId },
    include: {
      project: {
        include: {
          tasks: {
            where: {
              deletedAt: null,
            },
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  let totalWeightedProgress = 0;
  let totalWeight = 0;

  for (const pl of projectLinks) {
    const projectTasks = pl.project.tasks;

    if (projectTasks.length > 0) {
      const doneTasks = projectTasks.filter(t => t.status === 'DONE').length;
      const projectProgress = (doneTasks / projectTasks.length) * 100;

      totalWeightedProgress += projectProgress * (pl.contributionWeight / 100);
      totalWeight += pl.contributionWeight;
    }
  }

  if (totalWeight === 0) return 0;

  return Math.round(totalWeightedProgress / (totalWeight / 100));
}

/**
 * Update goal progress and cascade to parent goals if needed
 */
export async function updateGoalProgress(goalId: string): Promise<void> {
  const newProgress = await calculateGoalProgress(goalId);

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      progress: newProgress,
      status: newProgress === 0
        ? 'NOT_STARTED'
        : newProgress === 100
        ? 'COMPLETED'
        : 'IN_PROGRESS',
      completedAt: newProgress === 100 ? new Date() : null,
    },
  });
}

/**
 * Update all goals linked to a project
 */
export async function updateProjectGoalsProgress(projectId: string): Promise<void> {
  const goalLinks = await prisma.goalProject.findMany({
    where: { projectId },
    select: { goalId: true },
  });

  for (const link of goalLinks) {
    await updateGoalProgress(link.goalId);
  }
}

/**
 * Comprehensive update triggered when a task status changes
 */
export async function handleTaskStatusChange(taskId: string, projectId: string): Promise<void> {
  await calculateProjectProgress(projectId);
  await updateProjectGoalsProgress(projectId);
}
