import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const emailLogId = params.id;
        const { searchParams } = new URL(req.url);
        const originalUrl = searchParams.get('url');

        if (!originalUrl) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        // Update the email log to mark as clicked
        await prisma.emailLog.update({
            where: { id: emailLogId },
            data: {
                clickedAt: new Date(),
                clickCount: { increment: 1 },
                lastClickedAt: new Date(),
            },
        });

        // Redirect to the original URL
        return NextResponse.redirect(originalUrl);
    } catch (error) {
        console.error('Error tracking email click:', error);

        // Still redirect even if tracking fails
        const { searchParams } = new URL(req.url);
        const originalUrl = searchParams.get('url');

        if (originalUrl) {
            return NextResponse.redirect(originalUrl);
        }

        return NextResponse.redirect(new URL('/', req.url));
    }
}