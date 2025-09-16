import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Get all templates with their performance data
        const templates = await prisma.emailTemplate.findMany({
            include: {
                performance: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get email logs for each template
        const templatePerformance = await Promise.all(
            templates.map(async (template) => {
                // Find campaigns that used this template
                const campaigns = await prisma.campaign.findMany({
                    where: { templateId: template.id },
                    include: { emailLogs: true }
                });

                // Aggregate performance data
                let totalSent = 0;
                let totalOpened = 0;
                let totalClicked = 0;
                let totalReplied = 0;
                let totalBounced = 0;
                let totalResponseTime = 0;
                let responseCount = 0;
                let lastUsedAt: Date | null = null;

                campaigns.forEach(campaign => {
                    campaign.emailLogs.forEach(log => {
                        totalSent++;
                        
                        if (['DELIVERED', 'OPENED', 'CLICKED', 'REPLIED'].includes(log.status)) {
                            totalOpened++;
                        }
                        if (['CLICKED', 'REPLIED'].includes(log.status)) {
                            totalClicked++;
                        }
                        if (log.isReplied) {
                            totalReplied++;
                            if (log.repliedAt && log.sentAt) {
                                const responseTime = new Date(log.repliedAt).getTime() - new Date(log.sentAt).getTime();
                                totalResponseTime += responseTime / (1000 * 60 * 60); // Convert to hours
                                responseCount++;
                            }
                        }
                        if (log.status === 'BOUNCED') {
                            totalBounced++;
                        }
                        
                        if (log.sentAt) {
                            const sentDate = new Date(log.sentAt);
                            if (!lastUsedAt || sentDate > lastUsedAt) {
                                lastUsedAt = sentDate;
                            }
                        }
                    });
                });

                // Calculate rates
                const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
                const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
                const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;
                const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
                const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : null;

                // Calculate best performing day (simplified - would need more complex logic)
                const bestPerformingDay = 'Monday'; // This would be calculated based on actual data

                // Update or create performance record
                if (template.performance) {
                    await prisma.templatePerformance.update({
                        where: { id: template.performance.id },
                        data: {
                            totalSent,
                            totalOpened,
                            totalClicked,
                            totalReplied,
                            openRate: Number(openRate.toFixed(2)),
                            clickRate: Number(clickRate.toFixed(2)),
                            replyRate: Number(replyRate.toFixed(2)),
                            avgResponseTime,
                            bestPerformingDay,
                            lastUsedAt
                        }
                    });
                } else {
                    await prisma.templatePerformance.create({
                        data: {
                            templateId: template.id,
                            templateName: template.name,
                            totalSent,
                            totalOpened,
                            totalClicked,
                            totalReplied,
                            openRate: Number(openRate.toFixed(2)),
                            clickRate: Number(clickRate.toFixed(2)),
                            replyRate: Number(replyRate.toFixed(2)),
                            avgResponseTime,
                            bestPerformingDay,
                            lastUsedAt
                        }
                    });
                }

                return {
                    id: template.id,
                    templateName: template.name,
                    totalSent,
                    totalOpened,
                    totalClicked,
                    totalReplied,
                    totalBounced,
                    openRate: Number(openRate.toFixed(2)),
                    clickRate: Number(clickRate.toFixed(2)),
                    replyRate: Number(replyRate.toFixed(2)),
                    bounceRate: Number(bounceRate.toFixed(2)),
                    avgResponseTime,
                    bestPerformingDay,
                    lastUsedAt,
                    createdAt: template.createdAt
                };
            })
        );

        // Sort by open rate by default
        templatePerformance.sort((a, b) => b.openRate - a.openRate);

        // Get template usage statistics
        const totalTemplates = templates.length;
        const activeTemplates = templatePerformance.filter(t => t.totalSent > 0).length;
        const mostUsedTemplate = templatePerformance.reduce((max, current) => 
            current.totalSent > max.totalSent ? current : max, 
            templatePerformance[0] || { totalSent: 0 }
        );

        // Get performance trends (simplified)
        const performanceTrends = {
            bestOpenRate: Math.max(...templatePerformance.map(t => t.openRate)),
            bestClickRate: Math.max(...templatePerformance.map(t => t.clickRate)),
            bestReplyRate: Math.max(...templatePerformance.map(t => t.replyRate)),
            averageOpenRate: templatePerformance.reduce((sum, t) => sum + t.openRate, 0) / templatePerformance.length,
            averageClickRate: templatePerformance.reduce((sum, t) => sum + t.clickRate, 0) / templatePerformance.length,
            averageReplyRate: templatePerformance.reduce((sum, t) => sum + t.replyRate, 0) / templatePerformance.length
        };

        return NextResponse.json({
            templates: templatePerformance,
            summary: {
                totalTemplates,
                activeTemplates,
                mostUsedTemplate: mostUsedTemplate.templateName,
                mostUsedCount: mostUsedTemplate.totalSent
            },
            trends: performanceTrends
        });

    } catch (error) {
        console.error("Error fetching template analytics:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching template analytics." },
            { status: 500 }
        );
    }
}
