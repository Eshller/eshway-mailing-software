'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft,
    Mail,
    Eye,
    MousePointer,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    RefreshCw,
    Download,
    Share2
} from 'lucide-react';

interface CampaignData {
    id: string;
    name: string;
    subject: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    emailLogs: Array<{
        id: string;
        recipient: string;
        recipientName: string;
        status: string;
        sentAt: string;
        openedAt?: string;
        clickedAt?: string;
        repliedAt?: string;
        replyStatus?: string;
        replyContent?: string;
        error?: string;
    }>;
}

interface CampaignStats {
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalReplied: number;
    totalBounced: number;
    totalFailed: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
    bounceRate: number;
    failureRate: number;
}

interface TimeBasedData {
    hour: number;
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
}

export default function CampaignReportPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [timeBasedData, setTimeBasedData] = useState<TimeBasedData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchCampaignData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/campaigns/${campaignId}`);

            if (response.ok) {
                const campaignData = await response.json();

                // Transform the data to match the expected structure
                const transformedCampaign = {
                    id: campaignData.id,
                    name: campaignData.name,
                    subject: campaignData.emails?.[0]?.subject || 'No subject',
                    content: campaignData.emails?.[0]?.content || 'No content',
                    createdAt: campaignData.createdAt,
                    updatedAt: campaignData.updatedAt,
                    emailLogs: campaignData.emailLogs || []
                };

                setCampaign(transformedCampaign);

                // Calculate statistics
                const calculatedStats = calculateStats(transformedCampaign.emailLogs);
                setStats(calculatedStats);

                // Generate time-based data
                const timeData = generateTimeBasedData(transformedCampaign.emailLogs);
                setTimeBasedData(timeData);

                setLastUpdated(new Date());
            } else {
                console.error('Failed to fetch campaign data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching campaign data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetchCampaignData();
    }, [fetchCampaignData]);

    const calculateStats = (emailLogs: any[]): CampaignStats => {
        const totalSent = emailLogs.length;
        const totalDelivered = emailLogs.filter(log =>
            ['SENT', 'DELIVERED', 'REPLIED'].includes(log.status)
        ).length;
        const totalOpened = emailLogs.filter(log => log.openedAt).length;
        const totalClicked = emailLogs.filter(log => log.clickedAt).length;
        const totalReplied = emailLogs.filter(log => log.repliedAt).length;
        const totalBounced = emailLogs.filter(log => log.status === 'BOUNCED').length;
        const totalFailed = emailLogs.filter(log => log.status === 'FAILED').length;

        return {
            totalSent,
            totalDelivered,
            totalOpened,
            totalClicked,
            totalReplied,
            totalBounced,
            totalFailed,
            deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
            openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
            clickRate: totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0,
            replyRate: totalDelivered > 0 ? (totalReplied / totalDelivered) * 100 : 0,
            bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
            failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0,
        };
    };

    const generateTimeBasedData = (emailLogs: any[]): TimeBasedData[] => {
        const hourlyData: { [key: number]: TimeBasedData } = {};

        // Initialize 24 hours
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = {
                hour: i,
                sent: 0,
                opened: 0,
                clicked: 0,
                replied: 0
            };
        }

        // Process email logs
        emailLogs.forEach(log => {
            const sentHour = new Date(log.sentAt).getHours();
            hourlyData[sentHour].sent++;

            if (log.openedAt) {
                const openedHour = new Date(log.openedAt).getHours();
                hourlyData[openedHour].opened++;
            }

            if (log.clickedAt) {
                const clickedHour = new Date(log.clickedAt).getHours();
                hourlyData[clickedHour].clicked++;
            }

            if (log.repliedAt) {
                const repliedHour = new Date(log.repliedAt).getHours();
                hourlyData[repliedHour].replied++;
            }
        });

        return Object.values(hourlyData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SENT':
            case 'DELIVERED':
                return 'bg-green-100 text-green-800';
            case 'REPLIED':
                return 'bg-blue-100 text-blue-800';
            case 'BOUNCED':
                return 'bg-red-100 text-red-800';
            case 'FAILED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SENT':
            case 'DELIVERED':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'REPLIED':
                return <MessageSquare className="h-4 w-4 text-blue-600" />;
            case 'BOUNCED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'FAILED':
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-yellow-600" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading campaign report...</span>
                </div>
            </div>
        );
    }

    if (!campaign || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Not Found</h3>
                    <p className="text-gray-500 mb-4">The requested campaign could not be found.</p>
                    <Button onClick={() => router.push('/campaigns')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Campaigns
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/campaigns')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Campaigns
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
                    <p className="text-gray-600 mt-1">{campaign.subject}</p>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 mt-2">
                            Last updated: {lastUpdated.toLocaleString()}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchCampaignData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSent}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.deliveryRate.toFixed(1)}% delivered
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalOpened} opened
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalClicked} clicked
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.replyRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalReplied} replied
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="recipients">Recipients</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Delivery Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Delivery Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.totalDelivered}</div>
                                    <div className="text-sm text-gray-500">Delivered</div>
                                    <Progress value={stats.deliveryRate} className="mt-2" />
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.totalBounced}</div>
                                    <div className="text-sm text-gray-500">Bounced</div>
                                    <Progress value={stats.bounceRate} className="mt-2" />
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-600">{stats.totalFailed}</div>
                                    <div className="text-sm text-gray-500">Failed</div>
                                    <Progress value={stats.failureRate} className="mt-2" />
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.totalReplied}</div>
                                    <div className="text-sm text-gray-500">Replied</div>
                                    <Progress value={stats.replyRate} className="mt-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Engagement Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Engagement Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Open Rate</span>
                                    <div className="flex items-center gap-2">
                                        <Progress value={stats.openRate} className="w-32" />
                                        <span className="text-sm font-medium">{stats.openRate.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Click Rate</span>
                                    <div className="flex items-center gap-2">
                                        <Progress value={stats.clickRate} className="w-32" />
                                        <span className="text-sm font-medium">{stats.clickRate.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Reply Rate</span>
                                    <div className="flex items-center gap-2">
                                        <Progress value={stats.replyRate} className="w-32" />
                                        <span className="text-sm font-medium">{stats.replyRate.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="recipients" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Recipient Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Recipient</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Sent At</TableHead>
                                            <TableHead>Opened At</TableHead>
                                            <TableHead>Clicked At</TableHead>
                                            <TableHead>Replied At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaign.emailLogs.slice(0, 50).map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{log.recipientName}</div>
                                                        <div className="text-sm text-gray-500">{log.recipient}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(log.status)}>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusIcon(log.status)}
                                                            {log.status}
                                                        </div>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(log.sentAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {log.openedAt ? new Date(log.openedAt).toLocaleString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {log.clickedAt ? new Date(log.clickedAt).toLocaleString() : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {log.repliedAt ? new Date(log.repliedAt).toLocaleString() : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {campaign.emailLogs.length > 50 && (
                                    <div className="text-center py-4 text-gray-500">
                                        Showing 50 of {campaign.emailLogs.length} recipients
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Activity Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 mb-4">
                                    Campaign started: {new Date(campaign.createdAt).toLocaleString()}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {timeBasedData.slice(0, 24).map((data) => (
                                        <div key={data.hour} className="text-center p-3 border rounded-lg">
                                            <div className="text-lg font-semibold">{data.hour}:00</div>
                                            <div className="text-sm text-gray-600">
                                                {data.sent} sent, {data.opened} opened
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Performance Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium mb-4">Delivery Performance</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Delivered</span>
                                            <span className="font-medium">{stats.deliveryRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Bounced</span>
                                            <span className="font-medium">{stats.bounceRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Failed</span>
                                            <span className="font-medium">{stats.failureRate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-4">Engagement Performance</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Open Rate</span>
                                            <span className="font-medium">{stats.openRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Click Rate</span>
                                            <span className="font-medium">{stats.clickRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Reply Rate</span>
                                            <span className="font-medium">{stats.replyRate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
