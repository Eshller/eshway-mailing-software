import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaignId = params.id;
        const body = await req.json();
        const { name, subject, content, templateId, templateName } = body;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required." },
                { status: 400 }
            );
        }

        if (!name || !subject || !content) {
            return NextResponse.json(
                { error: "Name, subject, and content are required." },
                { status: 400 }
            );
        }

        // Update the campaign and its associated email
        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                name,
                templateId: templateId || null,
                templateName: templateName || null,
                emails: {
                    updateMany: {
                        where: { campaignId },
                        data: {
                            subject,
                            content,
                        },
                    },
                },
            },
            include: {
                emails: true,
            },
        });

        return NextResponse.json(updatedCampaign);
    } catch (error) {
        console.error("Error updating campaign:", error);
        return NextResponse.json(
            { error: "Internal server error while updating campaign." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaignId = params.id;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required." },
                { status: 400 }
            );
        }

        // Delete the campaign and all associated emails (cascade delete)
        await prisma.campaign.delete({
            where: { id: campaignId },
        });

        return NextResponse.json(
            { message: "Campaign deleted successfully." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return NextResponse.json(
            { error: "Internal server error while deleting campaign." },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaignId = params.id;

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required." },
                { status: 400 }
            );
        }

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                emails: true,
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(campaign);
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching campaign." },
            { status: 500 }
        );
    }
}
