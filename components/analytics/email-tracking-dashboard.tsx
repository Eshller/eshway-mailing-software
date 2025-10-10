'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Mail,
    Eye,
    MousePointer,
    MessageSquare,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface EmailTrackingDashboardProps {
    data: {
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
    } | null;
}

interface MetricCardProps {
    title: string;
    value: number;
    total: number;
    rate: number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
}

function MetricCard({ title, value, total, rate, icon, color, trend }: MetricCardProps) {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`p-2 rounded-full ${color}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{value.toLocaleString()}</span>
                    {trend && (
                        <div className="flex items-center space-x-1">
                            {getTrendIcon()}
                            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(trend)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Rate</span>
                        <span className="font-medium">{rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={rate} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>of {total.toLocaleString()} total</span>
                        <span>{value.toLocaleString()} emails</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function EmailTrackingDashboard({ data }: EmailTrackingDashboardProps) {
    if (!data) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="space-y-0 pb-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    const metrics = [
        {
            title: "Delivered",
            value: data.totalDelivered || 0,
            total: data.totalSent || 0,
            rate: data.deliveryRate || 0,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            color: "bg-green-100",
            trend: 2.1
        },
        {
            title: "Opened",
            value: data.totalOpened || 0,
            total: data.totalDelivered || 0,
            rate: data.openRate || 0,
            icon: <Eye className="h-4 w-4 text-blue-600" />,
            color: "bg-blue-100",
            trend: 1.5
        },
        {
            title: "Clicked",
            value: data.totalClicked || 0,
            total: data.totalOpened || 0,
            rate: data.clickRate || 0,
            icon: <MousePointer className="h-4 w-4 text-purple-600" />,
            color: "bg-purple-100",
            trend: 0.8
        },
        {
            title: "Replied",
            value: data.totalReplied || 0,
            total: data.totalDelivered || 0,
            rate: data.replyRate || 0,
            icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
            color: "bg-emerald-100",
            trend: 3.2
        }
    ];

    const getPerformanceStatus = (rate: number, type: string) => {
        const thresholds = {
            delivered: { good: 95, warning: 90 },
            opened: { good: 20, warning: 15 },
            clicked: { good: 3, warning: 2 },
            replied: { good: 5, warning: 3 }
        };

        const threshold = thresholds[type as keyof typeof thresholds];
        if (!threshold) {
            return { status: 'unknown', color: 'text-gray-600' };
        }

        if (rate >= threshold.good) return { status: 'excellent', color: 'text-green-600' };
        if (rate >= threshold.warning) return { status: 'good', color: 'text-yellow-600' };
        return { status: 'needs improvement', color: 'text-red-600' };
    };

    return (
        <div className="space-y-6">
            {/* Performance Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Performance Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map((metric, index) => {
                            const performance = getPerformanceStatus(metric.rate || 0, metric.title.toLowerCase());
                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">{metric.title}</span>
                                        <Badge variant="outline" className={performance.color}>
                                            {performance.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500">({Math.round(metric.rate || 0)}%)</span>
                                        </div>
                                        <Progress value={metric.rate || 0} className="h-2" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                ))}
            </div>

            {/* Campaign Performance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Campaign Performance Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Campaigns</span>
                                <Badge variant="secondary">Active</Badge>
                            </div>
                            <div className="text-2xl font-bold">{Math.ceil(data.totalSent / 100)}</div>
                            <p className="text-xs text-gray-500">Based on average 100 emails per campaign</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Average Open Rate</span>
                                <Badge variant={data.openRate >= 20 ? "default" : "destructive"}>
                                    {data.openRate >= 20 ? "Good" : "Low"}
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold">{data.openRate.toFixed(1)}%</div>
                            <p className="text-xs text-gray-500">Industry average: 21.3%</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Engagement Score</span>
                                <Badge variant={data.replyRate >= 5 ? "default" : "secondary"}>
                                    {data.replyRate >= 5 ? "High" : "Medium"}
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold">
                                {((data.openRate + data.clickRate + data.replyRate) / 3).toFixed(1)}%
                            </div>
                            <p className="text-xs text-gray-500">Combined engagement metric</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Detailed Reports
                        </Button>
                        <Button variant="outline" size="sm">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Export Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Review Bounced Emails
                        </Button>
                        <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Check Replies
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
