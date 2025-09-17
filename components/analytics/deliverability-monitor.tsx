'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Shield,
    Mail,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

interface DeliverabilityData {
    totalSent: number;
    totalDelivered: number;
    totalBounced: number;
    totalFailed: number;
    deliveryRate: number;
    bounceRate: number;
    spamScore: number;
    domainReputation: 'excellent' | 'good' | 'fair' | 'poor';
    recentBounces: Array<{
        email: string;
        reason: string;
        timestamp: string;
        type: 'hard' | 'soft';
    }>;
    topBounceReasons: Array<{
        reason: string;
        count: number;
        percentage: number;
    }>;
}

export function DeliverabilityMonitor() {
    const [data, setData] = useState<DeliverabilityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDeliverabilityData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/analytics/deliverability');
            if (response.ok) {
                const data = await response.json();
                setData(data);
            }
        } catch (error) {
            console.error('Error fetching deliverability data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliverabilityData();

        // Set up automatic refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDeliverabilityData();
        }, 30000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const getReputationColor = (reputation: string) => {
        switch (reputation) {
            case 'excellent': return 'text-green-600 bg-green-100';
            case 'good': return 'text-blue-600 bg-blue-100';
            case 'fair': return 'text-yellow-600 bg-yellow-100';
            case 'poor': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getReputationIcon = (reputation: string) => {
        switch (reputation) {
            case 'excellent': return <CheckCircle className="h-4 w-4" />;
            case 'good': return <CheckCircle className="h-4 w-4" />;
            case 'fair': return <AlertCircle className="h-4 w-4" />;
            case 'poor': return <XCircle className="h-4 w-4" />;
            default: return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getBounceTypeColor = (type: string) => {
        return type === 'hard' ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100';
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading deliverability data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500">Unable to load deliverability data at this time.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Email Deliverability Monitor</h2>
                    <p className="text-muted-foreground">
                        Monitor email delivery rates, bounce rates, and domain reputation
                    </p>
                </div>
                <Button onClick={fetchDeliverabilityData} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.deliveryRate.toFixed(1)}%</div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Progress value={data.deliveryRate} className="flex-1" />
                            <span className="text-sm text-gray-500">
                                {data.totalDelivered.toLocaleString()}/{data.totalSent.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.deliveryRate >= 95 ? 'Excellent' : data.deliveryRate >= 90 ? 'Good' : 'Needs Improvement'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.bounceRate.toFixed(1)}%</div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Progress value={data.bounceRate} className="flex-1" />
                            <span className="text-sm text-gray-500">
                                {data.totalBounced.toLocaleString()} bounces
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.bounceRate <= 2 ? 'Excellent' : data.bounceRate <= 5 ? 'Good' : 'Needs Attention'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Spam Score</CardTitle>
                        <Shield className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.spamScore.toFixed(1)}/10</div>
                        <div className="flex items-center space-x-2 mt-2">
                            <Progress value={data.spamScore * 10} className="flex-1" />
                            <span className="text-sm text-gray-500">
                                {data.spamScore <= 3 ? 'Low' : data.spamScore <= 6 ? 'Medium' : 'High'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.spamScore <= 3 ? 'Excellent' : data.spamScore <= 6 ? 'Good' : 'Needs Review'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Domain Reputation</CardTitle>
                        {getReputationIcon(data.domainReputation)}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{data.domainReputation}</div>
                        <Badge className={`mt-2 ${getReputationColor(data.domainReputation)}`}>
                            {data.domainReputation === 'excellent' ? 'A+' :
                                data.domainReputation === 'good' ? 'A' :
                                    data.domainReputation === 'fair' ? 'B' : 'C'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                            Based on recent sending patterns
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Bounce Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Recent Bounces
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.recentBounces.slice(0, 5).map((bounce, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm">{bounce.email}</div>
                                        <div className="text-xs text-gray-500">{bounce.reason}</div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(bounce.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <Badge className={getBounceTypeColor(bounce.type)}>
                                        {bounce.type === 'hard' ? 'Hard Bounce' : 'Soft Bounce'}
                                    </Badge>
                                </div>
                            ))}
                            {data.recentBounces.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    No recent bounces
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Top Bounce Reasons
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topBounceReasons.map((reason, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{reason.reason}</span>
                                        <span className="text-sm text-gray-500">{reason.count} ({reason.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <Progress value={reason.percentage} className="h-2" />
                                </div>
                            ))}
                            {data.topBounceReasons.length === 0 && (
                                <div className="text-center py-4 text-gray-500">
                                    No bounce data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Deliverability Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.deliveryRate < 95 && (
                            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-800">Low Delivery Rate</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Your delivery rate is below 95%. Consider cleaning your email list and improving your sender reputation.
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.bounceRate > 5 && (
                            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-red-800">High Bounce Rate</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        Your bounce rate is above 5%. Remove invalid email addresses and implement double opt-in.
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.spamScore > 6 && (
                            <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-orange-800">High Spam Score</h4>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Your emails have a high spam score. Review your content and avoid spam trigger words.
                                    </p>
                                </div>
                            </div>
                        )}

                        {data.deliveryRate >= 95 && data.bounceRate <= 2 && data.spamScore <= 3 && (
                            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-800">Excellent Deliverability</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Your email deliverability is excellent! Keep up the good work with your sending practices.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
