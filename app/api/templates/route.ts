import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching templates:", error);
        return NextResponse.json(
            { error: "Internal server error while fetching templates." },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, subject, content } = body;

        if (!name || !subject || !content) {
            return NextResponse.json(
                { error: "Name, subject, and content are required." },
                { status: 400 }
            );
        }

        // Check if template name already exists
        const existingTemplate = await prisma.emailTemplate.findFirst({
            where: { name }
        });

        if (existingTemplate) {
            return NextResponse.json(
                { error: "A template with this name already exists." },
                { status: 409 }
            );
        }

        const template = await prisma.emailTemplate.create({
            data: {
                name,
                subject,
                content,
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Error creating template:", error);
        return NextResponse.json(
            { error: "Internal server error while creating template." },
            { status: 500 }
        );
    }
}
