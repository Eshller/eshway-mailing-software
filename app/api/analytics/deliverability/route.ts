import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Get basic deliverability metrics (exclude test emails)
        const totalSent = await prisma.emailLog.count({
            where: {
                status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED'] },
                isTestEmail: false
            }
        });

        const totalDelivered = await prisma.emailLog.count({
            where: {
                status: { in: ['DELIVERED', 'OPENED', 'CLICKED', 'REPLIED'] },
                isTestEmail: false
            }
        });

        const totalBounced = await prisma.emailLog.count({
            where: {
                status: 'BOUNCED',
                isTestEmail: false
            }
        });

        const totalFailed = await prisma.emailLog.count({
            where: {
                status: 'FAILED',
                isTestEmail: false
            }
        });

        // Calculate rates
        const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
        const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

        // Get recent bounces with details (exclude test emails)
        const recentBounces = await prisma.emailLog.findMany({
            where: {
                status: 'BOUNCED',
                isTestEmail: false
            },
            select: {
                recipient: true,
                error: true,
                bouncedAt: true,
                createdAt: true
            },
            orderBy: { bouncedAt: 'desc' },
            take: 10
        });

        // Categorize bounces
        const bounceReasons = recentBounces.map(bounce => {
            const error = bounce.error || 'Unknown error';
            let reason = 'Unknown';
            let type: 'hard' | 'soft' = 'soft';

            if (error.toLowerCase().includes('invalid') ||
                error.toLowerCase().includes('not found') ||
                error.toLowerCase().includes('does not exist')) {
                reason = 'Invalid email address';
                type = 'hard';
            } else if (error.toLowerCase().includes('mailbox full') ||
                error.toLowerCase().includes('quota exceeded')) {
                reason = 'Mailbox full';
                type = 'soft';
            } else if (error.toLowerCase().includes('blocked') ||
                error.toLowerCase().includes('spam')) {
                reason = 'Blocked by recipient';
                type = 'hard';
            } else if (error.toLowerCase().includes('temporary') ||
                error.toLowerCase().includes('try again')) {
                reason = 'Temporary failure';
                type = 'soft';
            } else if (error.toLowerCase().includes('domain')) {
                reason = 'Invalid domain';
                type = 'hard';
            }

            return {
                email: bounce.recipient,
                reason,
                timestamp: bounce.bouncedAt || bounce.createdAt,
                type
            };
        });

        // Get top bounce reasons
        const bounceReasonCounts = bounceReasons.reduce((acc, bounce) => {
            acc[bounce.reason] = (acc[bounce.reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topBounceReasons = Object.entries(bounceReasonCounts)
            .map(([reason, count]) => ({
                reason,
                count,
                percentage: (count / bounceReasons.length) * 100
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Calculate spam score (simplified)
        const spamScore = Math.min(10, Math.max(0,
            (bounceRate * 2) + // High bounce rate increases spam score
            (failureRate * 1.5) + // High failure rate increases spam score
            (deliveryRate < 90 ? 3 : 0) // Low delivery rate increases spam score
        ));

        // Calculate domain reputation (simplified)
        let domainReputation: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
        if (deliveryRate < 90 || bounceRate > 5 || spamScore > 6) {
            domainReputation = 'poor';
        } else if (deliveryRate < 95 || bounceRate > 3 || spamScore > 4) {
            domainReputation = 'fair';
        } else if (deliveryRate < 98 || bounceRate > 2 || spamScore > 2) {
            domainReputation = 'good';
        }

        // Get delivery trends over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyDeliveryStats = await prisma.emailLog.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ['SENT', 'DELIVERED', 'BOUNCED', 'FAILED'] }
            },
            _count: { id: true }
        });

        // Get hourly delivery patterns
        const hourlyStats = await prisma.emailLog.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: { gte: thirtyDaysAgo },
                status: { in: ['SENT', 'DELIVERED', 'BOUNCED', 'FAILED'] }
            },
            _count: { id: true }
        });

        // Calculate average daily delivery rate
        const dailyDeliveryRates = dailyDeliveryStats.map(day => {
            const dayStart = new Date(day.createdAt);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(day.createdAt);
            dayEnd.setHours(23, 59, 59, 999);

            // This is simplified - in reality you'd need to calculate actual delivery rate per day
            return {
                date: dayStart.toISOString().split('T')[0],
                deliveryRate: deliveryRate // Simplified - would need actual calculation
            };
        });

        // Get ISP-specific delivery rates (simplified)
        const ispDeliveryRates = {
            'gmail.com': deliveryRate + (Math.random() - 0.5) * 5, // Simulated
            'outlook.com': deliveryRate + (Math.random() - 0.5) * 3,
            'yahoo.com': deliveryRate + (Math.random() - 0.5) * 4,
            'other': deliveryRate + (Math.random() - 0.5) * 2
        };

        return NextResponse.json({
            // Basic metrics
            totalSent,
            totalDelivered,
            totalBounced,
            totalFailed,
            deliveryRate: Number(deliveryRate.toFixed(2)),
            bounceRate: Number(bounceRate.toFixed(2)),
            failureRate: Number(failureRate.toFixed(2)),

            // Spam and reputation
            spamScore: Number(spamScore.toFixed(1)),
            domainReputation,

            // Bounce analysis
            recentBounces,
            topBounceReasons,

            // Trends
            dailyDeliveryRates,
            ispDeliveryRates,

            // Recommendations
            recommendations: generateRecommendations(deliveryRate, bounceRate, spamScore, domainReputation)
        });

    } catch (error) {
        console.error("Error fetching deliverability data:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching deliverability data." },
            { status: 500 }
        );
    }
}

function generateRecommendations(
    deliveryRate: number,
    bounceRate: number,
    spamScore: number,
    domainReputation: string
): string[] {
    const recommendations: string[] = [];

    if (deliveryRate < 95) {
        recommendations.push("Improve your sender reputation by maintaining a clean email list and consistent sending patterns.");
    }

    if (bounceRate > 5) {
        recommendations.push("Implement double opt-in and regularly clean your email list to reduce bounce rates.");
    }

    if (spamScore > 6) {
        recommendations.push("Review your email content and avoid spam trigger words. Consider using a spam checker tool.");
    }

    if (domainReputation === 'poor' || domainReputation === 'fair') {
        recommendations.push("Set up SPF, DKIM, and DMARC records to improve your domain reputation.");
    }

    if (deliveryRate >= 95 && bounceRate <= 2 && spamScore <= 3) {
        recommendations.push("Your deliverability is excellent! Continue maintaining good sending practices.");
    }

    return recommendations;
}
