import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import Anthropic from '@anthropic-ai/sdk';
import { resolveUserOrganization } from '@/lib/api-organization';
import logger from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Claude calls can take up to 30s

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * GET /api/ai/weekly-summary
 *
 * Generates an AI-written narrative of the current organization's activity
 * over the past 7 days using Claude Haiku. Returns structured stats plus
 * a human-readable summary suitable for Insights panel or email digest.
 *
 * Query params:
 * - days (optional, default 7): number of past days to summarize
 */
export async function GET(request: NextRequest) {
  try {
    const { data: ctx, error } = await resolveUserOrganization();
    if (error || !ctx) return error!;

    const organizationId = ctx.organizationId;
    const url = request.nextUrl;
    const days = Math.max(1, Math.min(90, parseInt(url.searchParams.get('days') || '7')));

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Parallel-fetch all the stats we need for the summary
    const [
      activityCount,
      tasksCompleted,
      tasksCreated,
      tasksUpdated,
      topUsers,
      actionBreakdown,
      recentActivities,
    ] = await Promise.all([
      prisma.userActivity.count({
        where: { organizationId, createdAt: { gte: since } },
      }),
      prisma.userActivity.count({
        where: {
          organizationId,
          entityType: 'TASK',
          action: 'COMPLETED',
          createdAt: { gte: since },
        },
      }),
      prisma.userActivity.count({
        where: {
          organizationId,
          entityType: 'TASK',
          action: 'CREATED',
          createdAt: { gte: since },
        },
      }),
      prisma.userActivity.count({
        where: {
          organizationId,
          entityType: 'TASK',
          action: 'UPDATED',
          createdAt: { gte: since },
        },
      }),
      prisma.userActivity.groupBy({
        by: ['userId'],
        where: { organizationId, createdAt: { gte: since } },
        _count: { _all: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5,
      }),
      prisma.userActivity.groupBy({
        by: ['action'],
        where: { organizationId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      // Sample of recent activities (most impactful) to give Claude context
      prisma.userActivity.findMany({
        where: { organizationId, createdAt: { gte: since } },
        orderBy: [{ impactScore: 'desc' }, { createdAt: 'desc' }],
        take: 40,
        select: {
          action: true,
          entityType: true,
          aiSummary: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Resolve user names for top contributors
    const topUserIds = topUsers.map((u: any) => u.userId);
    const users = topUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: topUserIds } },
          select: { id: true, name: true, email: true, avatar: true },
        })
      : [];
    const usersById = new Map(users.map((u: any) => [u.id, u]));
    const topContributors = topUsers.map((u: any) => ({
      user: usersById.get(u.userId) || null,
      activityCount: u._count._all,
    }));

    const stats = {
      days,
      totalActivities: activityCount,
      tasksCompleted,
      tasksCreated,
      tasksUpdated,
      topContributors,
      actionBreakdown: actionBreakdown.reduce((acc: Record<string, number>, g: any) => {
        acc[g.action] = g._count._all;
        return acc;
      }, {}),
    };

    // If no activity at all, skip the Claude call — just return empty stats
    if (activityCount === 0) {
      return NextResponse.json({
        summary: `No team activity recorded in the past ${days} days. When your team starts creating and working on tasks, this space will come alive with AI-written weekly insights.`,
        stats,
        generatedAt: new Date().toISOString(),
      });
    }

    // Build the context for Claude — compact but informative
    const activityLines = recentActivities
      .map((a: any) => {
        const user = a.user?.name || a.user?.email || 'Someone';
        const when = new Date(a.createdAt).toISOString().split('T')[0];
        return a.aiSummary
          ? `[${when}] ${a.aiSummary}`
          : `[${when}] ${user} ${a.action.toLowerCase()} a ${a.entityType.toLowerCase()}`;
      })
      .join('\n');

    const topContribLines = topContributors
      .slice(0, 3)
      .map((c: any, i: number) => `${i + 1}. ${c.user?.name || c.user?.email || 'Unknown'} — ${c.activityCount} actions`)
      .join('\n');

    const prompt = `You are an AI analyst generating a weekly team activity summary for a project management platform used by Ethiopian organizations.

ORGANIZATION STATS (past ${days} days):
- Total team actions: ${activityCount}
- Tasks completed: ${tasksCompleted}
- Tasks created: ${tasksCreated}
- Tasks updated: ${tasksUpdated}

TOP CONTRIBUTORS:
${topContribLines || 'None'}

RECENT ACTIVITY SAMPLE (up to 40 most impactful):
${activityLines}

Write a concise, encouraging summary in 3-4 short paragraphs covering:
1. What the team accomplished this week (lead with momentum)
2. Who stood out as top contributors (name them)
3. Any trends or patterns worth noting (velocity changes, focus areas)
4. A forward-looking closing line

Tone: Professional but warm. Write for a team lead who wants a quick pulse-check. Don't use bullet points or headers — flowing prose only. Don't repeat the raw stats verbatim; interpret them. Do NOT fabricate details not present in the data. Keep total length under 200 words.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary =
      message.content[0].type === 'text'
        ? message.content[0].text
        : 'Summary generation failed.';

    return NextResponse.json({
      summary,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Weekly summary generation error', {
      error: error instanceof Error ? error.message : error,
    });
    return NextResponse.json(
      { error: 'Failed to generate weekly summary' },
      { status: 500 }
    );
  }
}
