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
    fromEmail?: string;
    fromName?: string;
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

            try {
                // Format content with proper line breaks and then personalize
                const formattedContent = this.formatTextToHtml(emailData.content);
                const personalizedContent = this.personalizeContent(formattedContent, name);

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
                                Data: personalizedContent,
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

                // Log successful send
                await this.logEmailStatus(recipient, name, emailData.subject, emailData.content, 'SENT', response.MessageId);

                results.push({
                    success: true,
                    messageId: response.MessageId,
                    recipient,
                });

                console.log(`Email sent successfully to ${recipient}:`, response.MessageId);

            } catch (error) {
                console.error(`Failed to send email to ${recipient}:`, error);

                // Log failed send
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

    private personalizeContent(content: string, name: string): string {
        // Replace common placeholders
        return content
            .replace(/\[Recipient Name\]/g, name)
            .replace(/\[Name\]/g, name)
            .replace(/\[First Name\]/g, name.split(' ')[0])
            .replace(/\[Last Name\]/g, name.split(' ').slice(1).join(' '));
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
