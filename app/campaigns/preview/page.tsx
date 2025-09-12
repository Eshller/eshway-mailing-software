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

const EmailInterface = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    let template = null;
    if (typeof window !== 'undefined') {
        template = localStorage?.getItem('template');
    }
    const router = useRouter();

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

    const emailTemplate = JSON.parse(template || '{}');
    if (!emailTemplate || !emailTemplate.subject || !emailTemplate.content) {
        return <div className="flex justify-center items-center h-screen">
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-gray-500">No email template selected.</p>
                    <Button onClick={() => router.push('/campaigns')} className="mt-4">
                        Go Back to Template Selection
                    </Button>
                </div>
            </div>
        </div>
    }

    const handleSendEmail = async () => {
        setIsLoading(true);
        console.log('contacts', contacts);
        console.log('emailTemplate', emailTemplate);
        try {
            // const emails = selectedContacts.map(contact => {
            //     const personalizedContent = emailTemplate.content.replace('[Recipient Name]', contact.name);
            //     return {
            //         recipient: contact.email,
            //         subject: emailTemplate.subject,
            //         content: personalizedContent
            //     }
            // })
            console.log(`${process.env.NEXT_PUBLIC_API_URL_LOCAL}/send-email`);
            // console.log("recipients", selectedContacts.map(contact => contact.email));
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_LOCAL}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipients: selectedContacts.map(contact => contact.email),
                    name: selectedContacts.map(contact => contact.name),
                    subject: emailTemplate.subject,
                    content: emailTemplate.content
                })
            });
            const data = await response.json();
            console.log('data', data);
            toast({
                title: "Email sent",
                description: "Email sent successfully.",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error sending email",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
        // router.push('/');
    }

    const handleSelectContacts = (value: string) => {
        const selectedContacts = contacts.filter((contact) => contact.tags?.includes(value));
        setSelectedContacts(selectedContacts);
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
                            __html: emailTemplate.html ? `<style>${emailTemplate.css || ''}</style>${emailTemplate.html}` : emailTemplate.content
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
                            <Select onValueChange={(value: any) => handleSelectContacts(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select recipients" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.reduce((uniqueTags: string[], contact) => {
                                        const contactTags = contact.tags as string;
                                        contactTags?.split(',').forEach((tag: string) => {
                                            if (!uniqueTags.includes(tag)) {
                                                uniqueTags.push(tag);
                                            }
                                        });
                                        return uniqueTags;
                                    }, []).map((tag: string) => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedContacts.length > 0 && (
                            <div className="flex justify-center mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedContacts.slice(0, 5).map((contact) => (
                                            <TableRow key={contact.id}>
                                                <TableCell>{contact.name}</TableCell>
                                                <TableCell>{contact.email}</TableCell>
                                                <TableCell>{contact?.phone}</TableCell>
                                            </TableRow>
                                        ))}
                                        {selectedContacts.length > 5 && (
                                            <TableRow>
                                                <TableCell>
                                                    <span className="text-gray-500">
                                                        + {selectedContacts.length - 5} more
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button className="gap-2 bg-[#d86dfc] hover:bg-[#d86dfc]/80 text-white" onClick={handleSendEmail} disabled={isLoading || selectedContacts.length === 0}>{isLoading ? 'Sending...' : selectedContacts.length === 0 ? 'Select Recipients ^' : 'SEND'}</Button>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-screen">
                    <p className="text-gray-500">No email template selected</p>
                </div>
            )}
        </div>
    );
};

export default EmailInterface;