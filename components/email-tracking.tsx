'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Mail, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

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
}

interface StatusSummary {
    status: string;
    count: number;
}

const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    SENT: { color: 'bg-blue-100 text-blue-800', icon: Mail },
    DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    OPENED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CLICKED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    BOUNCED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    NOT_SENT: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

export function EmailTracking() {
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    const [statusSummary, setStatusSummary] = useState<StatusSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const fetchEmailLogs = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedStatus) params.append('status', selectedStatus);

            const response = await fetch(`/api/email-logs?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setEmailLogs(data.emailLogs);
                setStatusSummary(data.statusSummary);
            }
        } catch (error) {
            console.error('Error fetching email logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmailLogs();
    }, [selectedStatus]);

    const getStatusIcon = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Email Tracking</h2>
                <Button onClick={fetchEmailLogs} disabled={isLoading} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statusSummary.map(({ status, count }) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return (
                        <Card key={status} className="cursor-pointer" onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(status)}
                                        <span className="font-medium">{status.replace('_', ' ')}</span>
                                    </div>
                                    <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
                                        {count}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Email Logs */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Email Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                        </div>
                    ) : emailLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No email logs found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {emailLogs.map((log) => {
                                const config = statusConfig[log.status as keyof typeof statusConfig];
                                return (
                                    <div key={log.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(log.status)}
                                                <span className="font-medium">{log.recipient}</span>
                                                {log.recipientName && (
                                                    <span className="text-gray-500">({log.recipientName})</span>
                                                )}
                                            </div>
                                            <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
                                                {log.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            <strong>Subject:</strong> {log.subject}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            <strong>Created:</strong> {formatDate(log.createdAt)}
                                            {log.sentAt && (
                                                <span className="ml-4">
                                                    <strong>Sent:</strong> {formatDate(log.sentAt)}
                                                </span>
                                            )}
                                            {log.deliveredAt && (
                                                <span className="ml-4">
                                                    <strong>Delivered:</strong> {formatDate(log.deliveredAt)}
                                                </span>
                                            )}
                                            {log.openedAt && (
                                                <span className="ml-4">
                                                    <strong>Opened:</strong> {formatDate(log.openedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {log.error && (
                                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                <strong>Error:</strong> {log.error}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
