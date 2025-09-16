'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    ThumbsUp,
    ThumbsDown,
    HelpCircle,
    X,
    RefreshCw,
    Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailLog {
    id: string;
    recipient: string;
    recipientName: string;
    subject: string;
    status: string;
    isReplied: boolean;
    replyStatus: string | null;
    repliedAt: string | null;
    replyContent: string | null;
    sentAt: string;
    campaignId: string;
}

interface KanbanColumnProps {
    title: string;
    status: string;
    emails: EmailLog[];
    onUpdateReply: (emailId: string, replyStatus: string, replyContent: string) => void;
    onMoveToStatus: (emailId: string, newStatus: string) => void;
    icon: React.ReactNode;
    color: string;
}

function KanbanColumn({ title, status, emails, onUpdateReply, onMoveToStatus, icon, color }: KanbanColumnProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [replyStatus, setReplyStatus] = useState('');

    const handleReplyUpdate = () => {
        if (selectedEmail && replyStatus) {
            onUpdateReply(selectedEmail.id, replyStatus, replyContent);
            setSelectedEmail(null);
            setReplyContent('');
            setReplyStatus('');
            toast({
                title: "Reply updated",
                description: "Email reply status has been updated successfully.",
            });
        }
    };

    const getStatusColor = (replyStatus: string | null) => {
        switch (replyStatus) {
            case 'POSITIVE': return 'bg-green-100 text-green-800';
            case 'NEGATIVE': return 'bg-red-100 text-red-800';
            case 'NEUTRAL': return 'bg-gray-100 text-gray-800';
            case 'QUESTION': return 'bg-blue-100 text-blue-800';
            case 'INTERESTED': return 'bg-emerald-100 text-emerald-800';
            case 'NOT_INTERESTED': return 'bg-orange-100 text-orange-800';
            case 'FOLLOW_UP_NEEDED': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-4">
            <Card className={`border-l-4 ${color}`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                            {icon}
                            <span>{title}</span>
                            <Badge variant="secondary" className="ml-2">
                                {emails.length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {emails.slice(0, isExpanded ? emails.length : 3).map((email) => (
                        <div
                            key={email.id}
                            className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                            onClick={() => setSelectedEmail(email)}
                        >
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {email.recipientName || email.recipient}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {email.subject}
                                        </p>
                                    </div>
                                    {email.replyStatus && (
                                        <Badge className={`text-xs ${getStatusColor(email.replyStatus)}`}>
                                            {email.replyStatus.replace('_', ' ')}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{new Date(email.sentAt).toLocaleDateString()}</span>
                                    {email.repliedAt && (
                                        <span className="flex items-center">
                                            <MessageSquare className="h-3 w-3 mr-1" />
                                            {new Date(email.repliedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                {email.replyContent && (
                                    <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        "{email.replyContent.substring(0, 100)}..."
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {emails.length > 3 && !isExpanded && (
                        <p className="text-xs text-gray-500 text-center">
                            +{emails.length - 3} more emails
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Reply Update Modal */}
            {selectedEmail && (
                <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Update Reply Status</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedEmail(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium">To: {selectedEmail.recipientName || selectedEmail.recipient}</p>
                                <p className="text-xs text-gray-500">Subject: {selectedEmail.subject}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Reply Status</label>
                                <Select value={replyStatus} onValueChange={setReplyStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select reply status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="POSITIVE">Positive</SelectItem>
                                        <SelectItem value="NEGATIVE">Negative</SelectItem>
                                        <SelectItem value="NEUTRAL">Neutral</SelectItem>
                                        <SelectItem value="QUESTION">Question</SelectItem>
                                        <SelectItem value="INTERESTED">Interested</SelectItem>
                                        <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                                        <SelectItem value="FOLLOW_UP_NEEDED">Follow-up Needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Reply Content</label>
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Enter the reply content..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button onClick={handleReplyUpdate} className="flex-1">
                                    Update Reply
                                </Button>
                                <Button variant="outline" onClick={() => setSelectedEmail(null)}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Card>
            )}
        </div>
    );
}

export function ReplyTrackingKanban() {
    const [emails, setEmails] = useState<EmailLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/email-logs');
            if (response.ok) {
                const data = await response.json();
                setEmails(data.emailLogs || []);
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast({
                title: "Error",
                description: "Failed to fetch email data.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const updateReply = async (emailId: string, replyStatus: string, replyContent: string) => {
        try {
            const response = await fetch('/api/email-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailLogId: emailId,
                    replyStatus,
                    replyContent,
                    isReplied: true,
                    repliedAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                fetchEmails(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating reply:', error);
            toast({
                title: "Error",
                description: "Failed to update reply status.",
                variant: "destructive",
            });
        }
    };

    const moveToStatus = async (emailId: string, newStatus: string) => {
        // This would be implemented based on your business logic
        console.log(`Moving email ${emailId} to status ${newStatus}`);
    };

    const filteredEmails = emails.filter(email => {
        if (filter === 'all') return true;
        if (filter === 'replied') return email.isReplied;
        if (filter === 'no-reply') return !email.isReplied;
        return email.replyStatus === filter;
    });

    const noReplyEmails = filteredEmails.filter(email => !email.isReplied);
    const repliedEmails = filteredEmails.filter(email => email.isReplied && email.replyStatus === 'POSITIVE');
    const negativeEmails = filteredEmails.filter(email => email.replyStatus === 'NEGATIVE');
    const followUpEmails = filteredEmails.filter(email => email.replyStatus === 'FOLLOW_UP_NEEDED');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading reply data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Reply Tracking</h2>
                    <p className="text-muted-foreground">
                        Track and manage email replies across all campaigns
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Emails</SelectItem>
                            <SelectItem value="replied">Replied</SelectItem>
                            <SelectItem value="no-reply">No Reply</SelectItem>
                            <SelectItem value="POSITIVE">Positive</SelectItem>
                            <SelectItem value="NEGATIVE">Negative</SelectItem>
                            <SelectItem value="FOLLOW_UP_NEEDED">Follow-up</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchEmails} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KanbanColumn
                    title="No Reply"
                    status="no-reply"
                    emails={noReplyEmails}
                    onUpdateReply={updateReply}
                    onMoveToStatus={moveToStatus}
                    icon={<Clock className="h-4 w-4" />}
                    color="border-l-orange-500"
                />
                <KanbanColumn
                    title="Positive Replies"
                    status="positive"
                    emails={repliedEmails}
                    onUpdateReply={updateReply}
                    onMoveToStatus={moveToStatus}
                    icon={<ThumbsUp className="h-4 w-4" />}
                    color="border-l-green-500"
                />
                <KanbanColumn
                    title="Negative Replies"
                    status="negative"
                    emails={negativeEmails}
                    onUpdateReply={updateReply}
                    onMoveToStatus={moveToStatus}
                    icon={<ThumbsDown className="h-4 w-4" />}
                    color="border-l-red-500"
                />
                <KanbanColumn
                    title="Follow-up Needed"
                    status="follow-up"
                    emails={followUpEmails}
                    onUpdateReply={updateReply}
                    onMoveToStatus={moveToStatus}
                    icon={<AlertCircle className="h-4 w-4" />}
                    color="border-l-yellow-500"
                />
            </div>
        </div>
    );
}
