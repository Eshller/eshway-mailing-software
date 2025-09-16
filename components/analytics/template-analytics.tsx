'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Target,
    TrendingUp,
    TrendingDown,
    Star,
    Clock,
    Mail,
    Eye,
    MousePointer,
    MessageSquare,
    RefreshCw,
    BarChart3
} from 'lucide-react';

interface TemplatePerformance {
    id: string;
    templateName: string;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    avgResponseTime: number;
    bestPerformingDay: string;
    lastUsedAt: string;
}

export function TemplateAnalytics() {
    const [templates, setTemplates] = useState<TemplatePerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'openRate' | 'clickRate' | 'replyRate' | 'totalSent'>('openRate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchTemplateAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/analytics/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error('Error fetching template analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplateAnalytics();
    }, []);

    const sortedTemplates = [...templates].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const getPerformanceBadge = (rate: number, type: 'open' | 'click' | 'reply') => {
        const thresholds = {
            open: { excellent: 25, good: 20, average: 15 },
            click: { excellent: 5, good: 3, average: 2 },
            reply: { excellent: 8, good: 5, average: 3 }
        };

        const threshold = thresholds[type];
        if (rate >= threshold.excellent) return { label: 'Excellent', variant: 'default' as const };
        if (rate >= threshold.good) return { label: 'Good', variant: 'secondary' as const };
        if (rate >= threshold.average) return { label: 'Average', variant: 'outline' as const };
        return { label: 'Needs Improvement', variant: 'destructive' as const };
    };

    const getTrendIcon = (rate: number, type: 'open' | 'click' | 'reply') => {
        // This would be calculated based on historical data
        const isPositive = rate > 15; // Simplified logic
        return isPositive ?
            <TrendingUp className="h-4 w-4 text-green-500" /> :
            <TrendingDown className="h-4 w-4 text-red-500" />;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading template analytics...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Template Performance</h2>
                    <p className="text-muted-foreground">
                        Analyze and compare the performance of your email templates
                    </p>
                </div>
                <Button onClick={fetchTemplateAnalytics} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Template Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Template Performance Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Sort Controls */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-3 py-1 border rounded-md text-sm"
                                >
                                    <option value="openRate">Open Rate</option>
                                    <option value="clickRate">Click Rate</option>
                                    <option value="replyRate">Reply Rate</option>
                                    <option value="totalSent">Total Sent</option>
                                </select>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Template Name</TableHead>
                                        <TableHead className="text-center">Total Sent</TableHead>
                                        <TableHead className="text-center">Open Rate</TableHead>
                                        <TableHead className="text-center">Click Rate</TableHead>
                                        <TableHead className="text-center">Reply Rate</TableHead>
                                        <TableHead className="text-center">Avg Response Time</TableHead>
                                        <TableHead className="text-center">Best Day</TableHead>
                                        <TableHead className="text-center">Performance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedTemplates.map((template) => {
                                        const openBadge = getPerformanceBadge(template.openRate, 'open');
                                        const clickBadge = getPerformanceBadge(template.clickRate, 'click');
                                        const replyBadge = getPerformanceBadge(template.replyRate, 'reply');

                                        return (
                                            <TableRow key={template.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{template.templateName}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Last used: {new Date(template.lastUsedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <span className="font-medium">{template.totalSent.toLocaleString()}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {getTrendIcon(template.openRate, 'open')}
                                                        <span className="font-medium">{template.openRate.toFixed(1)}%</span>
                                                    </div>
                                                    <Badge variant={openBadge.variant} className="text-xs mt-1">
                                                        {openBadge.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {getTrendIcon(template.clickRate, 'click')}
                                                        <span className="font-medium">{template.clickRate.toFixed(1)}%</span>
                                                    </div>
                                                    <Badge variant={clickBadge.variant} className="text-xs mt-1">
                                                        {clickBadge.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        {getTrendIcon(template.replyRate, 'reply')}
                                                        <span className="font-medium">{template.replyRate.toFixed(1)}%</span>
                                                    </div>
                                                    <Badge variant={replyBadge.variant} className="text-xs mt-1">
                                                        {replyBadge.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm">
                                                            {template.avgResponseTime ? `${template.avgResponseTime.toFixed(1)}h` : 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {template.bestPerformingDay || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="flex space-x-1">
                                                            {template.openRate >= 20 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                                            {template.clickRate >= 3 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                                            {template.replyRate >= 5 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Performing Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-5 w-5" />
                            Best Open Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {templates.length > 0 ? (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    {templates.reduce((best, current) =>
                                        current.openRate > best.openRate ? current : best
                                    ).templateName}
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {Math.max(...templates.map(t => t.openRate)).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">
                                    {templates.reduce((best, current) =>
                                        current.openRate > best.openRate ? current : best
                                    ).totalSent.toLocaleString()} emails sent
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">No data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MousePointer className="h-5 w-5" />
                            Best Click Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {templates.length > 0 ? (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    {templates.reduce((best, current) =>
                                        current.clickRate > best.clickRate ? current : best
                                    ).templateName}
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {Math.max(...templates.map(t => t.clickRate)).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">
                                    {templates.reduce((best, current) =>
                                        current.clickRate > best.clickRate ? current : best
                                    ).totalSent.toLocaleString()} emails sent
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">No data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MessageSquare className="h-5 w-5" />
                            Best Reply Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {templates.length > 0 ? (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    {templates.reduce((best, current) =>
                                        current.replyRate > best.replyRate ? current : best
                                    ).templateName}
                                </div>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {Math.max(...templates.map(t => t.replyRate)).toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-500">
                                    {templates.reduce((best, current) =>
                                        current.replyRate > best.replyRate ? current : best
                                    ).totalSent.toLocaleString()} emails sent
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
