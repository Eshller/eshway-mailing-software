import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";

export function DashboardHeader() {
    const { user } = useAuth();

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex w-full items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <div className="flex items-center gap-2">
                    <h1 className="text-base font-medium">Dashboard</h1>
                    <span className="text-sm text-muted-foreground">
                        Welcome back, {user?.username}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {/* Add any additional header actions here */}
                </div>
            </div>
        </header>
    );
}


