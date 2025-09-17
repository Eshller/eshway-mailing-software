import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Get total contacts count
        const totalContacts = await prisma.contact.count();

        // Get contacts created in the last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const contactsLastMonth = await prisma.contact.count({
            where: {
                createdAt: {
                    gte: lastMonth,
                },
            },
        });

        // Get total campaigns count (if campaigns exist)
        const totalCampaigns = await prisma.campaign.count();

        // Get campaigns created in the last month
        const campaignsLastMonth = await prisma.campaign.count({
            where: {
                createdAt: {
                    gte: lastMonth,
                },
            },
        });

        // Get recent contacts (last 5)
        const recentContacts = await prisma.contact.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // Get recent campaigns (last 5)
        const recentCampaigns = await prisma.campaign.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                name: true,
                createdAt: true,
            },
        });

        // Calculate mock open rate and click rate based on available data
        // In a real app, these would come from email tracking data
        const mockOpenRate = totalContacts > 0 ? Math.min(25 + Math.random() * 10, 35).toFixed(1) : "0.0";
        const mockClickRate = totalContacts > 0 ? Math.min(2 + Math.random() * 2, 5).toFixed(1) : "0.0";

        return NextResponse.json({
            stats: {
                totalContacts,
                contactsLastMonth,
                totalCampaigns,
                campaignsLastMonth,
                openRate: mockOpenRate,
                clickRate: mockClickRate,
            },
            recentActivity: {
                contacts: recentContacts,
                campaigns: recentCampaigns,
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}


