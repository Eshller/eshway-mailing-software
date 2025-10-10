// app/api/contacts/[id]/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Prisma client import

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();
        if (!id) {
            return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
        }

        console.log("Delete contact with ID:", id);

        const contact = await prisma.contact.findUnique({
            where: { id: id }
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // Proceed to delete
        await prisma.contact.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "Contact deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}

// New PATCH function to edit/update contact
export async function PATCH(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop();
        if (!id) {
            return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
        }
        // const { id } = params; // Get contact ID from URL parameters

        // Parsing the request body to get the new data for contact
        const { name, email, company, tags, phone } = await req.json(); // Request body should contain name, email, company, and tags

        console.log("Update contact with ID:", id);
        console.log("Request body:", req.body);
        console.log("New data:", { name, email, company, tags, phone });

        // Validate the incoming data (if essential fields are missing)
        if (!name) {
            return NextResponse.json({ error: "Missing required field: name is required" }, { status: 400 });
        }

        // Ensure tags are formatted properly, split and trim if necessary

        // Check if the contact exists
        const contact = await prisma.contact.findUnique({
            where: { id: id }
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        // Email validation function
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        // Proceed to update the contact in the database
        const updatedContact = await prisma.contact.update({
            where: { id: id },
            data: {
                name,
                email: email || null,
                emailValidated: email ? isValidEmail(email) : false,
                company,
                tags,
                phone
            },
        });

        // Return the updated contact data
        return NextResponse.json(updatedContact, { status: 200 });
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}