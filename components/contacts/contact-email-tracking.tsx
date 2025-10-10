'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Mail,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    MousePointer,
    Calendar,
    TrendingUp,
    Users
} from 'lucide-react';

interface EmailLog {
    id: string;
    recipient: string;
    recipientName?: string;
    subject: string;
    status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' | 'NOT_SENT';
    error?: string;
    sentAt?: string;
    deliveredAt?: string;
    openedAt?: string;
    clickedAt?: string;
    bouncedAt?: string;
    createdAt: string;
    campaign?: {
        id: string;
        name: string;
        createdAt: string;
    };
}

interface ContactEmailTrackingProps {
    contactId: string;
    contactName: string;
    contactEmail?: string;
}

const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
    SENT: { color: 'bg-blue-100 text-blue-800', icon: Mail, label: 'Sent' },
    DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
    OPENED: { color: 'bg-green-100 text-green-800', icon: Eye, label: 'Opened' },
    CLICKED: { color: 'bg-green-100 text-green-800', icon: MousePointer, label: 'Clicked' },
    BOUNCED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Bounced' },
    FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
    NOT_SENT: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'Not Sent' },
};

export function ContactEmailTracking({ contactId, contactName, contactEmail }: ContactEmailTrackingProps) {
    const [emailHistory, setEmailHistory] = useState<EmailLog[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEmailHistory();
    }, [contactId]);

    const fetchEmailHistory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/contacts/${contactId}/email-history`);
            const data = await response.json();

            if (response.ok) {
                setEmailHistory(data.emailHistory);
                setSummary(data.summary);
                setRecentCampaigns(data.recentCampaigns);
            }
        } catch (error) {
            console.error('Error fetching email history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getRelativeTime = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!contactEmail) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Email Address</h3>
                    <p className="text-gray-600">This contact doesn&apos;t have an email address, so no emails have been sent.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                                <p className="text-2xl font-bold text-gray-900">{summary?.totalEmails || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Successful</p>
                                <p className="text-2xl font-bold text-green-600">{summary?.successfulEmails || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                                <p className="text-2xl font-bold text-purple-600">{summary?.openRate || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <MousePointer className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                                <p className="text-2xl font-bold text-orange-600">{summary?.clickRate || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Campaigns */}
            {recentCampaigns.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Recent Campaigns</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentCampaigns.map((campaign) => (
                                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            {campaign._count.emailLogs} email(s) sent • {getRelativeTime(campaign.createdAt)}
                                        </p>
                                    </div>
                                    <Badge variant="outline">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Email History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Mail className="h-5 w-5" />
                            <span>Email History</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchEmailHistory}>
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {emailHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Sent</h3>
                            <p className="text-gray-600">This contact hasn&apos;t received any emails yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {emailHistory.map((email) => (
                                <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-medium text-gray-900">{email.subject}</h4>
                                                <Badge className={statusConfig[email.status as keyof typeof statusConfig]?.color}>
                                                    {getStatusIcon(email.status)}
                                                    <span className="ml-1">{statusConfig[email.status as keyof typeof statusConfig]?.label}</span>
                                                </Badge>
                                            </div>

                                            {email.campaign && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <strong>Campaign:</strong> {email.campaign.name}
                                                </p>
                                            )}

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Sent: {getRelativeTime(email.createdAt)}</span>
                                                {email.sentAt && (
                                                    <span>Delivered: {getRelativeTime(email.sentAt)}</span>
                                                )}
                                                {email.openedAt && (
                                                    <span className="text-green-600">Opened: {getRelativeTime(email.openedAt)}</span>
                                                )}
                                                {email.clickedAt && (
                                                    <span className="text-blue-600">Clicked: {getRelativeTime(email.clickedAt)}</span>
                                                )}
                                            </div>

                                            {email.error && (
                                                <p className="text-sm text-red-600 mt-2">
                                                    <strong>Error:</strong> {email.error}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
