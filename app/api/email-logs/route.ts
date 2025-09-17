import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const where = status ? { status: status as any } : {};

        const emailLogs = await prisma.emailLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const totalCount = await prisma.emailLog.count({ where });

        // Get status summary
        const statusSummary = await prisma.emailLog.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        return NextResponse.json({
            emailLogs,
            totalCount,
            statusSummary: statusSummary.map(item => ({
                status: item.status,
                count: item._count.status
            }))
        });

    } catch (error) {
        console.error("Error fetching email logs:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching email logs." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            emailLogId,
            status,
            providerId,
            error,
            replyStatus,
            replyContent,
            isReplied,
            repliedAt
        } = body;

        if (!emailLogId) {
            return NextResponse.json(
                { error: "Email log ID is required." },
                { status: 400 }
            );
        }

        const updateData: any = {};

        // Handle basic status updates
        if (status) {
            updateData.status = status;

            // Set timestamps based on status
            const now = new Date();
            if (status === 'SENT') updateData.sentAt = now;
            if (status === 'DELIVERED') updateData.deliveredAt = now;
            if (status === 'OPENED') updateData.openedAt = now;
            if (status === 'CLICKED') updateData.clickedAt = now;
            if (status === 'BOUNCED') updateData.bouncedAt = now;
            if (status === 'REPLIED') updateData.repliedAt = now;
        }

        // Handle reply updates
        if (replyStatus !== undefined) updateData.replyStatus = replyStatus;
        if (replyContent !== undefined) updateData.replyContent = replyContent;
        if (isReplied !== undefined) updateData.isReplied = isReplied;
        if (repliedAt !== undefined) updateData.repliedAt = new Date(repliedAt);

        // Handle other fields
        if (providerId) updateData.providerId = providerId;
        if (error) updateData.error = error;

        // If we're updating reply status, also update the main status to REPLIED
        if (replyStatus && !status) {
            updateData.status = 'REPLIED';
            updateData.repliedAt = new Date();
        }

        const updatedLog = await prisma.emailLog.update({
            where: { id: emailLogId },
            data: updateData,
        });

        return NextResponse.json(updatedLog);

    } catch (error) {
        console.error("Error updating email log:", error);
        return NextResponse.json(
            { error: "Internal server error while updating email log." },
            { status: 500 }
        );
    }
}
