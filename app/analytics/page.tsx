'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Mail,
    Eye,
    MousePointer,
    MessageSquare,
    TrendingUp,
    Calendar,
    Users,
    Target,
    AlertCircle,
    CheckCircle,
    Clock,
    RefreshCw
} from 'lucide-react';
import { EmailTrackingDashboard } from '@/components/analytics/email-tracking-dashboard';
import { ReplyTrackingKanban } from '@/components/analytics/reply-tracking-kanban';
import { TemplateAnalytics } from '@/components/analytics/template-analytics';
import { DeliverabilityMonitor } from '@/components/analytics/deliverability-monitor';
import { KPIDashboard } from '@/components/analytics/kpi-dashboard';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

interface AnalyticsData {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    totalBounced: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    bounceRate: number;
    deliveryRate: number;
}

function AnalyticsPageContent() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAnalytics = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const response = await fetch('/api/analytics');
            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading analytics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Analytics</h1>
                    <p className="text-muted-foreground">
                        Track performance, monitor deliverability, and optimize your email campaigns
                    </p>
                    {lastUpdated && (
                        <div className="text-sm text-gray-500 mt-1">
                            Last updated: {lastUpdated.toLocaleString()}
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => fetchAnalytics(true)}
                    variant="outline"
                    size="sm"
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            {/* KPI Dashboard */}
            <KPIDashboard data={analyticsData} />

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="campaigns" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="replies" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Replies
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="deliverability" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Deliverability
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <EmailTrackingDashboard data={analyticsData} />
                </TabsContent>

                <TabsContent value="campaigns">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Campaign Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Detailed campaign performance metrics and analysis will be displayed here.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="replies">
                    <ReplyTrackingKanban />
                </TabsContent>

                <TabsContent value="templates">
                    <TemplateAnalytics />
                </TabsContent>

                <TabsContent value="deliverability">
                    <DeliverabilityMonitor />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <AnalyticsPageContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
