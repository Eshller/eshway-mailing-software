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

        // Get real analytics data from email logs (exclude test emails)
        const emailLogs = await prisma.emailLog.findMany({
            where: {
                isTestEmail: false
            }
        });

        const totalSent = emailLogs.length;
        const totalDelivered = emailLogs.filter(log => log.status === 'DELIVERED' || log.status === 'SENT').length;
        const totalOpened = emailLogs.filter(log => log.openedAt).length;
        const totalClicked = emailLogs.filter(log => log.clickedAt).length;

        // Calculate real rates
        const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : "0.0";
        const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : "0.0";

        return NextResponse.json({
            stats: {
                totalContacts,
                contactsLastMonth,
                totalCampaigns,
                campaignsLastMonth,
                openRate: openRate,
                clickRate: clickRate,
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


