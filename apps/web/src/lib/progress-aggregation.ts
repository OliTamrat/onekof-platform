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
 * 1. Linked tasks (direct task → goal links)
 * 2. Linked projects (project → goal links with contribution weights)
 * 3. Key results completion
 */
export async function calculateGoalProgress(goalId: string): Promise<number> {
  // Get all key results for this goal
  const keyResults = await prisma.keyResult.findMany({
    where: {
      goalId,
    },
  });

  // If there are key results, calculate based on them
  if (keyResults.length > 0) {
    let totalProgress = 0;

    for (const kr of keyResults) {
      const krProgress = (kr.current / kr.target) * 100;
      totalProgress += Math.min(krProgress, 100); // Cap at 100% per KR
    }

    return Math.round(totalProgress / keyResults.length);
  }

  // Otherwise, calculate from tasks and projects

  // Get directly linked tasks
  const taskLinks = await prisma.taskGoal.findMany({
    where: { goalId },
    include: {
      task: {
        select: {
          status: true,
        },
      },
    },
  });

  // Get linked projects
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

  // Calculate progress from directly linked tasks
  if (taskLinks.length > 0) {
    const doneTasks = taskLinks.filter(tl => tl.task.status === 'DONE').length;
    const taskProgress = (doneTasks / taskLinks.length) * 100;

    // Direct tasks have equal weight to one project
    totalWeightedProgress += taskProgress;
    totalWeight += 100;
  }

  // Calculate progress from linked projects
  for (const pl of projectLinks) {
    const projectTasks = pl.project.tasks;

    if (projectTasks.length > 0) {
      const doneTasks = projectTasks.filter(t => t.status === 'DONE').length;
      const projectProgress = (doneTasks / projectTasks.length) * 100;

      // Weight the project progress by its contribution weight
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
      // Update status based on progress
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

  // Update each linked goal's progress
  for (const link of goalLinks) {
    await updateGoalProgress(link.goalId);
  }
}

/**
 * Update all goals linked to a task
 */
export async function updateTaskGoalsProgress(taskId: string): Promise<void> {
  const goalLinks = await prisma.taskGoal.findMany({
    where: { taskId },
    select: { goalId: true },
  });

  // Update each linked goal's progress
  for (const link of goalLinks) {
    await updateGoalProgress(link.goalId);
  }
}

/**
 * Comprehensive update triggered when a task status changes
 */
export async function handleTaskStatusChange(taskId: string, projectId: string): Promise<void> {
  // Update project progress (future enhancement - could store this)
  const projectProgress = await calculateProjectProgress(projectId);

  // Update all goals linked to the project
  await updateProjectGoalsProgress(projectId);

  // Update all goals directly linked to this task
  await updateTaskGoalsProgress(taskId);
}
