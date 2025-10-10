import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
        }

        // Get contact details
        const contact = await prisma.contact.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                emailValidated: true,
                company: true,
                tags: true,
                phone: true,
                createdAt: true
            }
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // Get email history for this contact (only if they have an email)
        const emailHistory = contact.email ? await prisma.emailLog.findMany({
            where: {
                recipient: contact.email
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        }) : [];

        // Get email statistics (only if contact has email)
        const emailStats = contact.email ? await prisma.emailLog.groupBy({
            by: ['status'],
            where: {
                recipient: contact.email
            },
            _count: {
                status: true
            }
        }) : [];

        // Calculate summary stats
        const totalEmails = emailHistory.length;
        const successfulEmails = emailHistory.filter(e => ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'].includes(e.status)).length;
        const failedEmails = emailHistory.filter(e => ['FAILED', 'BOUNCED', 'NOT_SENT'].includes(e.status)).length;
        const openedEmails = emailHistory.filter(e => ['OPENED', 'CLICKED'].includes(e.status)).length;
        const clickedEmails = emailHistory.filter(e => e.status === 'CLICKED').length;

        // Get recent campaigns this contact was part of (only if contact has email)
        const recentCampaigns = contact.email ? await prisma.campaign.findMany({
            where: {
                emailLogs: {
                    some: {
                        recipient: contact.email
                    }
                }
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        emailLogs: {
                            where: {
                                recipient: contact.email
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        }) : [];

        return NextResponse.json({
            contact,
            emailHistory,
            emailStats,
            summary: {
                totalEmails,
                successfulEmails,
                failedEmails,
                openedEmails,
                clickedEmails,
                openRate: totalEmails > 0 ? (openedEmails / totalEmails * 100).toFixed(1) : 0,
                clickRate: totalEmails > 0 ? (clickedEmails / totalEmails * 100).toFixed(1) : 0
            },
            recentCampaigns
        });

    } catch (error) {
        console.error("Error fetching contact email history:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
