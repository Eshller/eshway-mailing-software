import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import prisma from '@/lib/prisma';

// Initialize AWS SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export interface EmailData {
    recipients: string[];
    names: string[];
    subject: string;
    content: string;
    campaignId?: string;
    fromEmail?: string;
    fromName?: string;
    isTestEmail?: boolean;
    contacts?: any[]; // Full contact data for personalization
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    recipient: string;
}

export class EmailService {
    private fromEmail: string;
    private fromName: string;

    constructor() {
        this.fromEmail = process.env.AWS_SES_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'ltd@eshway.com';
        this.fromName = process.env.AWS_SES_FROM_NAME || 'Mailway';
    }

    async sendEmail(emailData: EmailData): Promise<EmailResult[]> {
        const results: EmailResult[] = [];

        for (let i = 0; i < emailData.recipients.length; i++) {
            const recipient = emailData.recipients[i];
            const name = emailData.names[i] || 'Valued Customer';

            // Find the contact data for this recipient
            const contact = emailData.contacts?.find(c => c.email === recipient);

            try {
                // Create email log first to get the ID for tracking
                const emailLog = await this.createEmailLog(recipient, name, emailData.subject, emailData.content, emailData.campaignId, emailData.isTestEmail);

                // Format content with proper line breaks and then personalize
                const formattedContent = this.formatTextToHtml(emailData.content);
                const personalizedContent = this.personalizeContent(formattedContent, name, contact);

                // Add tracking to the content using the email log ID
                const trackedContent = this.addTrackingToContent(personalizedContent, emailLog.id);

                // Create email command
                const command = new SendEmailCommand({
                    Source: `${this.fromName} <${this.fromEmail}>`,
                    Destination: {
                        ToAddresses: [recipient],
                    },
                    Message: {
                        Subject: {
                            Data: emailData.subject,
                            Charset: 'UTF-8',
                        },
                        Body: {
                            Html: {
                                Data: trackedContent,
                                Charset: 'UTF-8',
                            },
                            Text: {
                                Data: this.stripHtml(personalizedContent),
                                Charset: 'UTF-8',
                            },
                        },
                    },
                });

                // Send email
                const response = await sesClient.send(command);

                // Update email log with success status
                await this.updateEmailLogStatus(emailLog.id, 'SENT', response.MessageId);

                results.push({
                    success: true,
                    messageId: response.MessageId,
                    recipient,
                });

                console.log(`Email sent successfully to ${recipient}:`, response.MessageId);

            } catch (error) {
                console.error(`Failed to send email to ${recipient}:`, error);

                // Log failed send using the existing logEmailStatus method
                await this.logEmailStatus(recipient, name, emailData.subject, emailData.content, 'FAILED', undefined, error instanceof Error ? error.message : 'Unknown error');

                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    recipient,
                });
            }
        }

        return results;
    }

    private formatTextToHtml(text: string): string {
        return text
            .replace(/\n/g, '<br>') // Convert line breaks to HTML breaks
            .replace(/\r\n/g, '<br>') // Convert Windows line breaks
            .replace(/\r/g, '<br>'); // Convert Mac line breaks
    }

    private personalizeContent(content: string, name: string, contact?: any): string {
        // Extract name parts
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Get contact data with fallbacks
        const email = contact?.email || '';
        const company = contact?.company || '';
        const phone = contact?.phone || '';
        const tags = contact?.tags || '';

        console.log('Personalizing content for:', {
            name,
            contact: contact ? {
                email: contact.email,
                company: contact.company,
                phone: contact.phone,
                tags: contact.tags
            } : 'No contact data',
            variables: { firstName, lastName, email, company, phone, tags }
        });

        // Replace all placeholders
        const personalized = content
            .replace(/\[Recipient Name\]/g, name)
            .replace(/\[Name\]/g, name)
            .replace(/\[First Name\]/g, firstName)
            .replace(/\[Last Name\]/g, lastName)
            .replace(/\[Email\]/g, email)
            .replace(/\[Company\]/g, company)
            .replace(/\[Phone\]/g, phone)
            .replace(/\[Tags\]/g, tags);

        console.log('Personalized content:', personalized.substring(0, 200) + '...');

        return personalized;
    }

    private addTrackingToContent(content: string, campaignId?: string): string {
        // Add open tracking pixel
        const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/track/open/${campaignId}" width="1" height="1" style="display:none;" />`;

        // Add click tracking to all links
        const trackedContent = content.replace(
            /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
            (match, beforeHref, url, afterHref) => {
                const trackedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/track/click/${campaignId}?url=${encodeURIComponent(url)}`;
                return `<a ${beforeHref}href="${trackedUrl}"${afterHref}>`;
            }
        );

        // Add tracking pixel at the end of the content
        return trackedContent + trackingPixel;
    }

    private stripHtml(html: string): string {
        return html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .replace(/&#39;/g, "'") // Replace &#39; with '
            .trim();
    }

    private async createEmailLog(
        recipient: string,
        recipientName: string,
        subject: string,
        content: string,
        campaignId?: string,
        isTestEmail?: boolean
    ): Promise<any> {
        try {
            const emailLog = await prisma.emailLog.create({
                data: {
                    recipient,
                    recipientName,
                    subject,
                    content,
                    status: 'PENDING',
                    provider: 'AWS SES',
                    campaignId,
                    isTestEmail: isTestEmail || false,
                },
            });
            return emailLog;
        } catch (error) {
            console.error('Error creating email log:', error);
            throw error;
        }
    }

    private async updateEmailLogStatus(
        emailLogId: string,
        status: string,
        providerId?: string,
        error?: string
    ): Promise<void> {
        try {
            const updateData: any = {
                status: status as any,
            };

            if (providerId) updateData.providerId = providerId;
            if (error) updateData.error = error;
            if (status === 'SENT') updateData.sentAt = new Date();

            await prisma.emailLog.update({
                where: { id: emailLogId },
                data: updateData,
            });
        } catch (error) {
            console.error('Error updating email log status:', error);
        }
    }

    private async logEmailStatus(
        recipient: string,
        recipientName: string,
        subject: string,
        content: string,
        status: 'SENT' | 'FAILED' | 'PENDING',
        providerId?: string,
        error?: string
    ): Promise<void> {
        try {
            await prisma.emailLog.create({
                data: {
                    recipient,
                    recipientName,
                    subject,
                    content,
                    status,
                    provider: 'AWS SES',
                    providerId,
                    error,
                    sentAt: status === 'SENT' ? new Date() : undefined,
                },
            });
        } catch (logError) {
            console.error('Failed to log email status:', logError);
        }
    }

    async verifyEmailAddress(email: string): Promise<boolean> {
        try {
            // This is a simple validation - in production you might want to use AWS SES verify email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        } catch (error) {
            console.error('Email validation error:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
