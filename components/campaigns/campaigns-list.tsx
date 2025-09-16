'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    Mail,
    Calendar,
    Users,
    Loader2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Email {
    id: string;
    subject: string;
    content: string;
    createdAt: string;
}

interface Campaign {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    emails: Email[];
}

export function CampaignsList() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/campaigns');
            const data = await response.json();
            setCampaigns(data);
        } catch (error) {
            toast({
                title: "Error fetching campaigns",
                description: "Please try again.",
                variant: "destructive",
            });
            console.error("Error fetching campaigns:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleEdit = (campaign: Campaign) => {
        // Store campaign data in localStorage for editing
        if (campaign.emails.length > 0) {
            const email = campaign.emails[0]; // Get the first email
            localStorage.setItem('template', JSON.stringify({
                id: campaign.id,
                name: campaign.name,
                subject: email.subject,
                content: email.content,
                html: email.content,
                css: ''
            }));
            router.push('/campaigns?mode=create');
        } else {
            // Handle old campaigns without email data
            toast({
                title: "Cannot edit this campaign",
                description: "This campaign was created before email data was properly saved. Please create a new campaign.",
                variant: "destructive",
            });
        }
    };

    const handlePreview = (campaign: Campaign) => {
        // Store campaign data for preview
        if (campaign.emails.length > 0) {
            const email = campaign.emails[0];
            localStorage.setItem('template', JSON.stringify({
                id: campaign.id,
                name: campaign.name,
                subject: email.subject,
                content: email.content,
                html: email.content,
                css: ''
            }));
            router.push('/campaigns/preview');
        } else {
            // Handle old campaigns without email data
            toast({
                title: "Cannot preview this campaign",
                description: "This campaign was created before email data was properly saved. Please create a new campaign.",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (campaignId: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const response = await fetch(`/api/campaigns/${campaignId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Campaign deleted",
                    description: "Campaign has been deleted successfully.",
                });
                fetchCampaigns(); // Refresh the list
            } else {
                throw new Error('Failed to delete campaign');
            }
        } catch (error) {
            toast({
                title: "Error deleting campaign",
                description: "Please try again.",
                variant: "destructive",
            });
            console.error("Error deleting campaign:", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                    <p className="text-gray-500 mb-4">Create your first email campaign to get started.</p>
                    <Button onClick={() => router.push('/campaigns')}>
                        Create Campaign
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(campaign.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        {campaign.emails.length} email(s)
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={campaign.emails.length > 0 ? "secondary" : "destructive"}>
                                    {campaign.emails.length > 0 ? campaign.emails[0].subject : 'No email data'}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handlePreview(campaign)}>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEdit(campaign)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(campaign.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    {campaign.emails.length > 0 && (
                        <CardContent className="pt-0">
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Subject: {campaign.emails[0].subject}</p>
                                <div
                                    className="prose prose-sm max-w-none text-gray-500"
                                    dangerouslySetInnerHTML={{
                                        __html: campaign.emails[0].content.substring(0, 200) + '...'
                                    }}
                                />
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
}
