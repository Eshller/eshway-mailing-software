'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Mail,
    Eye,
    MousePointer,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface KPIDashboardProps {
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

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number;
    description: string;
    icon: React.ReactNode;
    status?: 'good' | 'warning' | 'danger';
    format?: 'number' | 'percentage' | 'currency';
}

function KPICard({ title, value, trend, description, icon, status = 'good', format = 'number' }: KPICardProps) {
    const formatValue = (val: string | number) => {
        if (format === 'percentage') {
            return `${val}%`;
        }
        if (format === 'currency') {
            return `$${val}`;
        }
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    };

    const getStatusColor = () => {
        switch (status) {
            case 'good': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'danger': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`p-2 rounded-full ${getStatusColor().replace('text-', 'bg-').replace('-600', '-100')}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{formatValue(value)}</span>
                        {trend && (
                            <div className="flex items-center space-x-1">
                                {getTrendIcon()}
                                <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(trend)}%
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-gray-500">{description}</p>
                    {status === 'warning' && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Needs Attention
                        </Badge>
                    )}
                    {status === 'danger' && (
                        <Badge variant="outline" className="text-red-600 border-red-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Critical
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function KPIDashboard({ data }: KPIDashboardProps) {
    if (!data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-0 pb-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const kpis = [
        {
            title: "Total Emails Sent",
            value: data.totalSent,
            description: "Total emails sent across all campaigns",
            icon: <Mail className="h-4 w-4" />,
            status: 'good' as const,
            format: 'number' as const
        },
        {
            title: "Delivery Rate",
            value: Math.round(data.deliveredRate || 0),
            description: `Delivered: ${(data.totalDelivered || 0).toLocaleString()} of ${(data.totalSent || 0).toLocaleString()}`,
            icon: <CheckCircle className="h-4 w-4" />,
            status: (data.deliveredRate || 0) >= 95 ? 'good' : (data.deliveredRate || 0) >= 90 ? 'warning' : 'danger',
            format: 'percentage' as const
        },
        {
            title: "Open Rate",
            value: Math.round(data.openRate || 0),
            description: `Opened: ${(data.totalOpened || 0).toLocaleString()} emails`,
            icon: <Eye className="h-4 w-4" />,
            status: (data.openRate || 0) >= 20 ? 'good' : (data.openRate || 0) >= 15 ? 'warning' : 'danger',
            format: 'percentage' as const
        },
        {
            title: "Click Rate",
            value: Math.round(data.clickRate || 0),
            description: `Clicked: ${(data.totalClicked || 0).toLocaleString()} emails`,
            icon: <MousePointer className="h-4 w-4" />,
            status: (data.clickRate || 0) >= 3 ? 'good' : (data.clickRate || 0) >= 2 ? 'warning' : 'danger',
            format: 'percentage' as const
        },
        {
            title: "Reply Rate",
            value: Math.round(data.replyRate || 0),
            description: `Replied: ${(data.totalReplied || 0).toLocaleString()} emails`,
            icon: <MessageSquare className="h-4 w-4" />,
            status: (data.replyRate || 0) >= 5 ? 'good' : (data.replyRate || 0) >= 3 ? 'warning' : 'danger',
            format: 'percentage' as const
        },
        {
            title: "Bounce Rate",
            value: Math.round(data.bounceRate || 0),
            description: `Bounced: ${(data.totalBounced || 0).toLocaleString()} emails`,
            icon: <AlertCircle className="h-4 w-4" />,
            status: (data.bounceRate || 0) <= 2 ? 'good' : (data.bounceRate || 0) <= 5 ? 'warning' : 'danger',
            format: 'percentage' as const
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {kpis.map((kpi, index) => (
                <KPICard key={index} {...kpi} />
            ))}
        </div>
    );
}
