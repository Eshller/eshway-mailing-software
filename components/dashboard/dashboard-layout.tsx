"use client";

import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "16rem",
                    "--header-height": "4rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <DashboardHeader />
                <div className="flex flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}




















