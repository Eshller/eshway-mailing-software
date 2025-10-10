'use client';
import React, { useState, useEffect } from 'react';
import {
    Archive,
    Trash2,
    Clock,
    MoreHorizontal,
    Star,
    Mail,
    ArrowLeft
} from 'lucide-react';
import {
    Button
} from '@/components/ui/button';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Contact } from '@prisma/client';
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmailProgressTracker } from '@/components/campaigns/email-progress-tracker';
import { BatchProgress } from '@/lib/email-service';

// Utility function to convert text content to HTML with proper line breaks
const formatTextToHtml = (text: string): string => {
    return text
        .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
        .replace(/\r\n/g, '<br>') // Convert Windows line breaks
        .replace(/\r/g, '<br>'); // Convert Mac line breaks
};

// Smart Contact Table Component that dynamically shows columns based on data
const ContactTable = ({ contacts }: { contacts: Contact[] }) => {
    // Analyze which fields have data
    const hasPhone = contacts.some(contact => contact.phone && contact.phone.trim() !== '');
    const hasCompany = contacts.some(contact => contact.company && contact.company.trim() !== '');
    const hasTags = contacts.some(contact => contact.tags && contact.tags.trim() !== '');

    // Define columns to show
    const columns = [
        { key: 'name', label: 'Name', show: true },
        { key: 'email', label: 'Email', show: true },
        { key: 'phone', label: 'Phone', show: hasPhone },
        { key: 'company', label: 'Company', show: hasCompany },
        { key: 'tags', label: 'Tags', show: hasTags },
    ].filter(col => col.show);

    const formatValue = (contact: Contact, key: string) => {
        switch (key) {
            case 'name':
                return contact.name;
            case 'email':
                return contact.email;
            case 'phone':
                return contact.phone || '-';
            case 'company':
                return contact.company || '-';
            case 'tags':
                return contact.tags || '-';
            default:
                return '-';
        }
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-2 text-sm text-gray-600">
                Showing {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                {hasPhone && ' • Phone numbers available'}
                {hasCompany && ' • Company info available'}
                {hasTags && ' • Tags available'}
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.key}>{column.label}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.slice(0, 10).map((contact) => (
                        <TableRow key={contact.id}>
                            {columns.map((column) => (
                                <TableCell key={column.key}>
                                    {formatValue(contact, column.key)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                    {contacts.length > 10 && (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="text-center text-gray-500">
                                + {contacts.length - 10} more contact{contacts.length - 10 !== 1 ? 's' : ''}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

const EmailInterface = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [template, setTemplate] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [showProgressTracker, setShowProgressTracker] = useState(false);
    const [emailProgress, setEmailProgress] = useState<BatchProgress | null>(null);
    const [progressId, setProgressId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Set client-side flag and load template from localStorage
        setIsClient(true);
        const savedTemplate = localStorage?.getItem('template');
        setTemplate(savedTemplate);
    }, []);

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/contacts");
                const data = await response.json();
                setContacts(data);
                console.log('contacts fetched', contacts);
            } catch (error) {
                toast({
                    title: "Error fetching contacts",
                    description: "Please try again.",
                    variant: "destructive",
                });
                console.error("Error fetching contacts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContacts();
    }, []);

    // Poll progress when sending emails
    useEffect(() => {
        if (!progressId || !showProgressTracker) return;

        const pollProgress = async () => {
            try {
                const response = await fetch(`/api/send-bulk-email?progressId=${progressId}`);
                if (response.ok) {
                    const data = await response.json();
                    setEmailProgress(data.progress);

                    // Don't auto-close when complete, let user close manually
                    // if (data.progress.isComplete) {
                    //     setShowProgressTracker(false);
                    //     setProgressId(null);
                    // }
                }
            } catch (error) {
                console.error('Error polling progress:', error);
            }
        };

        const interval = setInterval(pollProgress, 1000); // Poll every second
        return () => clearInterval(interval);
    }, [progressId, showProgressTracker]);

    // Show loading state while client-side hydration is happening
    if (!isClient) {
        return <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    }

    const emailTemplate = template ? JSON.parse(template) : null;
    if (!emailTemplate || !emailTemplate.subject || !emailTemplate.content) {
        return <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <p className="text-gray-500">No email template selected.</p>
                <Button onClick={() => router.push('/campaigns')} className="mt-4">
                    Go Back to Template Selection
                </Button>
            </div>
        </div>
    }

    const handleSendEmail = async () => {
        if (selectedContacts.length === 0) {
            toast({
                title: "No Recipients Selected",
                description: "Please select at least one contact to send emails to.",
                variant: "destructive",
            });
            return;
        }

        // Generate progress ID
        const newProgressId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setProgressId(newProgressId);
        setShowProgressTracker(true);
        setEmailProgress({
            totalEmails: selectedContacts.length,
            processedEmails: 0,
            currentBatch: 0,
            totalBatches: 0,
            successCount: 0,
            errorCount: 0,
            isComplete: false
        });

        console.log("Sending email to:", selectedContacts.map(contact => contact.email));

        try {
            const response = await fetch('/api/send-bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipients: selectedContacts.map(contact => contact.email),
                    names: selectedContacts.map(contact => contact.name),
                    subject: emailTemplate.subject,
                    content: emailTemplate.content,
                    campaignId: emailTemplate.campaignId,
                    progressId: newProgressId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Handle different types of errors with specific messages
                if (response.status === 503) {
                    // Email service not configured
                    toast({
                        title: "Email Service Not Configured",
                        description: errorData.message || "Please configure an email service to send emails.",
                        variant: "destructive",
                    });
                    setShowProgressTracker(false);
                    setProgressId(null);
                    return;
                } else if (response.status === 501) {
                    // Email service not implemented
                    toast({
                        title: "Email Service Not Implemented",
                        description: "Email service is configured but not yet implemented. Please contact support.",
                        variant: "destructive",
                    });
                    setShowProgressTracker(false);
                    setProgressId(null);
                    return;
                } else {
                    // Other errors
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
            }

            const data = await response.json();
            console.log('Email sending result:', data);

            if (data.success) {
                const { successfulSends, failedSends, invalidEmails } = data.details;
                let message = data.message;

                if (failedSends > 0) {
                    message += ` (${failedSends} failed)`;
                }
                if (invalidEmails.length > 0) {
                    message += ` (${invalidEmails.length} invalid emails)`;
                }

                toast({
                    title: "Email Campaign Complete",
                    description: message,
                    variant: "default",
                });

                // Show option to view report
                setTimeout(() => {
                    if (confirm('Campaign sent successfully! Would you like to view the detailed report?')) {
                        router.push(`/campaigns/${emailTemplate.campaignId}/report`);
                    }
                }, 1000);
            } else {
                toast({
                    title: "Email Not Sent",
                    description: data.message || "Email was not sent. Please check the configuration.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error sending email",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
            setShowProgressTracker(false);
            setProgressId(null);
        }
    }

    const handleSelectContacts = (value: string) => {
        if (value === 'all-valid') {
            // Select all contacts with valid emails
            const validContacts = contacts.filter(contact =>
                contact.email && contact.emailValidated
            );
            setSelectedContacts(validContacts);
        } else {
            // Select contacts by tag (only those with valid emails)
            const selectedContacts = contacts.filter((contact) =>
                contact.tags?.includes(value) && contact.email && contact.emailValidated
            );
            setSelectedContacts(selectedContacts);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => router.push('/campaigns')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Preview</h1>
            {emailTemplate ? (
                <>
                    <div className="max-w-5xl mx-auto p-4 bg-white">
                        {/* Email Actions Bar */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Archive className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Clock className="h-4 w-4" />
                            </Button>

                            <div className="ml-auto">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Email Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-xl font-semibold">{emailTemplate.subject}</h1>
                                    <Button variant="secondary" size="sm">
                                        Inbox
                                    </Button>
                                </div>
                                <Star className="h-5 w-5 text-gray-400 hover:text-yellow-400 cursor-pointer" />
                            </div>

                            <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="/api/placeholder/32/32" alt="JD" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">John Doe</p>
                                            <p className="text-sm text-gray-500">john.doe@company.com</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <span>Jan 7, 2025, 10:30 AM</span>
                                            <Mail className="inline-block ml-2 h-4 w-4" />
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <span className="text-sm text-gray-500">to me</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Content */}
                        <div className="prose max-w-none mb-8 border-2 border-gray-200 p-4 rounded-md" dangerouslySetInnerHTML={{
                            __html: emailTemplate.html ? `<style>${emailTemplate.css || ''}</style>${emailTemplate.html}` : formatTextToHtml(emailTemplate.content)
                        }} />

                        {/* Reply Actions */}
                        {/* <div className="flex gap-2">
                            <Button className="gap-2">
                                <Reply className="h-4 w-4" />
                                Reply
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Forward className="h-4 w-4" />
                                Forward
                            </Button>
                        </div> */}
                        <div className="max-w-5xl mx-auto">
                            {/* Email Delivery Status */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-blue-900 mb-2">Email Delivery Status</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-600 font-medium">
                                            {contacts.filter(c => c.email && c.emailValidated).length}
                                        </span>
                                        <span className="text-gray-600"> valid emails</span>
                                    </div>
                                    <div>
                                        <span className="text-red-600 font-medium">
                                            {contacts.filter(c => !c.email || !c.emailValidated).length}
                                        </span>
                                        <span className="text-gray-600"> invalid/missing emails</span>
                                    </div>
                                </div>
                                {contacts.filter(c => !c.email || !c.emailValidated).length > 0 && (
                                    <div className="mt-2 text-sm text-amber-700">
                                        ⚠️ {contacts.filter(c => !c.email || !c.emailValidated).length} contacts will be excluded from this campaign
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Select Recipients
                                </label>
                                <Select onValueChange={(value: any) => handleSelectContacts(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose recipients" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all-valid">
                                            <div className="flex justify-between items-center w-full">
                                                <span>All Valid Contacts</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({contacts.filter(c => c.email && c.emailValidated).length} contacts)
                                                </span>
                                            </div>
                                        </SelectItem>
                                        {contacts.reduce((uniqueTags: string[], contact) => {
                                            const contactTags = contact.tags as string;
                                            contactTags?.split(',').forEach((tag: string) => {
                                                const trimmedTag = tag.trim();
                                                if (trimmedTag && !uniqueTags.includes(trimmedTag)) {
                                                    uniqueTags.push(trimmedTag);
                                                }
                                            });
                                            return uniqueTags;
                                        }, []).map((tag: string) => {
                                            const tagContacts = contacts.filter(contact =>
                                                contact.tags?.includes(tag) && contact.email && contact.emailValidated
                                            );
                                            return (
                                                <SelectItem key={tag} value={tag}>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span>{tag}</span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({tagContacts.length} valid contact{tagContacts.length !== 1 ? 's' : ''})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {selectedContacts.length > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-gray-600">
                                        <strong>{selectedContacts.length}</strong> contact{selectedContacts.length !== 1 ? 's' : ''} selected
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedContacts([])}
                                    >
                                        Clear Selection
                                    </Button>
                                </div>
                                <div className="flex justify-center">
                                    <ContactTable contacts={selectedContacts} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button
                            className="gap-2 bg-[#d86dfc] hover:bg-[#d86dfc]/80 text-white"
                            onClick={handleSendEmail}
                            disabled={isLoading || selectedContacts.length === 0 || showProgressTracker}
                        >
                            {showProgressTracker ? 'Sending...' : isLoading ? 'Sending...' : selectedContacts.length === 0 ? 'Select Recipients ^' : 'SEND'}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-gray-500">No email template selected</p>
                </div>
            )}

            {/* Progress Tracker Modal */}
            <EmailProgressTracker
                isVisible={showProgressTracker}
                onClose={() => {
                    setShowProgressTracker(false);
                    setProgressId(null);
                }}
                progress={emailProgress || undefined}
            />
        </div>
    );
};

export default EmailInterface;