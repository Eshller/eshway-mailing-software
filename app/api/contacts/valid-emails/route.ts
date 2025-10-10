import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const tag = searchParams.get('tag');

        // Build where clause for filtering
        const whereClause: any = {
            email: {
                not: null
            },
            emailValidated: true
        };

        // Add tag filter if specified
        if (tag && tag !== 'all') {
            whereClause.tags = {
                contains: tag
            };
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                company: true,
                tags: true,
                phone: true
            }
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts with valid emails:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}






