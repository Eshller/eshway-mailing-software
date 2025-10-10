import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Email validation function
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function POST(req: Request) {
    try {
        console.log("req", req);
        const body = await req.json();

        const contacts = Array.isArray(body.contacts) ? body.contacts : [body];

        if (contacts.length === 0 || !contacts.every((contact: any) => contact.name)) {
            return NextResponse.json({ error: "Each contact must have a name." }, { status: 400 });
        }

        if (contacts.length > 1) {
            const createdContacts = await prisma.contact.createMany({
                data: contacts.map((contact: any) => ({
                    name: contact.name,
                    email: contact.email || null,
                    emailValidated: contact.email ? isValidEmail(contact.email) : false,
                    phone: contact.phone,
                    company: contact.company,
                    tags: contact.tags,
                })),
            });
            return NextResponse.json(createdContacts, { status: 201 });
        }

        else {
            const contact = contacts[0];
            const createdContact = await prisma.contact.create({
                data: {
                    name: contact.name,
                    email: contact.email || null,
                    emailValidated: contact.email ? isValidEmail(contact.email) : false,
                    phone: contact.phone,
                    company: contact.company,
                    tags: contact.tags,
                },
            });
            return NextResponse.json(createdContact, { status: 201 });
        }
    } catch (error) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const emailStatus = searchParams.get('emailStatus'); // 'valid', 'invalid', 'none'
        const tags = searchParams.get('tags'); // comma-separated tags

        // Build the orderBy clause
        let orderBy: any = {};
        if (sortBy === 'name') {
            orderBy = { name: sortOrder };
        } else if (sortBy === 'email') {
            orderBy = { email: sortOrder };
        } else if (sortBy === 'createdAt') {
            orderBy = { createdAt: sortOrder };
        } else if (sortBy === 'updatedAt') {
            orderBy = { updatedAt: sortOrder };
        } else {
            orderBy = { createdAt: 'desc' }; // default to latest first
        }

        // Build the where clause
        const where: any = {};

        // Filter by email status
        if (emailStatus === 'valid') {
            where.emailValidated = true;
        } else if (emailStatus === 'invalid') {
            where.emailValidated = false;
        } else if (emailStatus === 'none') {
            where.email = null;
        }

        // Filter by tags
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            where.tags = {
                contains: tagArray[0] // For now, just check if it contains the first tag
            };
        }

        const contacts = await prisma.contact.findMany({
            where,
            orderBy,
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}