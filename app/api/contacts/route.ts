import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        console.log("req", req);
        const body = await req.json();

        const contacts = Array.isArray(body.contacts) ? body.contacts : [body];

        if (contacts.length === 0 || !contacts.every((contact: any) => contact.name && contact.email)) {
            return NextResponse.json({ error: "Each contact must have a name and email." }, { status: 400 });
        }

        if (contacts.length > 1) {
            const createdContacts = await prisma.contact.createMany({
                data: contacts.map((contact: any) => ({
                    name: contact.name,
                    email: contact.email,
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
                    email: contact.email,
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

export async function GET() {
    const contacts = await prisma.contact.findMany();
    return NextResponse.json(contacts);
}