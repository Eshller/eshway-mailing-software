import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, subject, content, templateId, templateName } = body;

        if (!name || !subject || !content) {
            return NextResponse.json(
                { error: "Name, subject, and content are required." },
                { status: 400 }
            );
        }

        const campaign = await prisma.campaign.create({
            data: {
                name,
                templateId: templateId || null,
                templateName: templateName || null,
                emails: {
                    create: {
                        subject,
                        content,
                    }
                }
            },
            include: {
                emails: true,
            }
        });

        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error("Error creating campaign:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        console.log("Fetching campaigns...");

        const campaigns = await prisma.campaign.findMany({
            include: {
                emails: true, // Include associated emails
                emailLogs: {
                    where: {
                        isTestEmail: false // Exclude test emails from count
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        console.log("Campaigns fetched:", campaigns?.length || 0);

        // Ensure we return an array even if campaigns is null/undefined
        return NextResponse.json(campaigns || []);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json(
            {
                error: "Internal server error.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
