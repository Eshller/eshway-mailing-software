import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Get all email logs and calculate analytics (exclude test emails)
        const emailLogs = await prisma.emailLog.findMany({
            where: {
                isTestEmail: false
            }
        });

        const totalSent = emailLogs.length;
        const totalDelivered = emailLogs.filter(log => log.status === 'DELIVERED' || log.status === 'SENT' || log.status === 'REPLIED').length;
        const totalOpened = emailLogs.filter(log => log.openedAt).length;
        const totalClicked = emailLogs.filter(log => log.clickedAt).length;
        const totalReplied = emailLogs.filter(log => log.isReplied).length;
        const totalBounced = emailLogs.filter(log => log.status === 'BOUNCED').length;
        const totalFailed = emailLogs.filter(log => log.status === 'FAILED').length;

        // Calculate rates
        const deliveredRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
        const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
        const replyRate = totalDelivered > 0 ? (totalReplied / totalDelivered) * 100 : 0;
        const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await prisma.emailLog.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
                isTestEmail: false, // Exclude test emails from recent activity
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });

        // Get campaign analytics
        const campaignAnalytics = await prisma.campaign.findMany({
            include: {
                emailLogs: true,
            },
        });

        const campaignStats = campaignAnalytics.map(campaign => {
            const logs = campaign.emailLogs;
            const sent = logs.length;
            const delivered = logs.filter(log => log.status === 'DELIVERED' || log.status === 'SENT' || log.status === 'REPLIED').length;
            const opened = logs.filter(log => log.openedAt).length;
            const clicked = logs.filter(log => log.clickedAt).length;
            const replied = logs.filter(log => log.isReplied).length;

            return {
                id: campaign.id,
                name: campaign.name,
                sent,
                delivered,
                opened,
                clicked,
                replied,
                openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
                clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
                replyRate: delivered > 0 ? (replied / delivered) * 100 : 0,
            };
        });

        return NextResponse.json({
            totalSent,
            totalDelivered,
            totalOpened,
            totalClicked,
            totalReplied,
            totalBounced,
            totalFailed,
            deliveredRate,
            openRate,
            clickRate,
            replyRate,
            bounceRate,
            recentActivity,
            campaignStats,
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}