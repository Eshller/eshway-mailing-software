import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import prisma from '@/lib/prisma';

// Initialize AWS SES client
const sesClient = new SESClient({
    region: process.env.MAILWAY_AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.MAILWAY_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.MAILWAY_AWS_SECRET_ACCESS_KEY!,
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

export interface BatchProgress {
    totalEmails: number;
    processedEmails: number;
    currentBatch: number;
    totalBatches: number;
    successCount: number;
    errorCount: number;
    isComplete: boolean;
}

export interface BatchConfig {
    batchThreshold: number;
    batchSize: number;
    rateLimit: number; // emails per second
    maxRetries: number;
    retryDelay: number; // milliseconds
}

export class EmailService {
    private fromEmail: string;
    private fromName: string;
    private batchConfig: BatchConfig;
    private progressCallback?: (progress: BatchProgress) => void;
    private settingsLoaded: boolean = false;

    constructor() {
        // Initialize with defaults - will be updated when settings are loaded
        this.fromEmail = process.env.AWS_SES_FROM_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'ltd@eshway.com';
        this.fromName = process.env.AWS_SES_FROM_NAME || 'Eshway';

        // Smart batching configuration
        this.batchConfig = {
            batchThreshold: 100,    // Use batching for 100+ emails
            batchSize: 50,          // Process 50 emails per batch
            rateLimit: 14,          // AWS SES rate limit (emails per second)
            maxRetries: 3,          // Retry failed batches up to 3 times
            retryDelay: 2000        // Wait 2 seconds between retries
        };
    }

    // Set progress callback for real-time updates
    setProgressCallback(callback: (progress: BatchProgress) => void) {
        this.progressCallback = callback;
    }

    // Load email settings from database
    private async loadEmailSettings(): Promise<void> {
        try {
            const settings = await prisma.settings.findMany({
                where: { category: 'email' }
            });

            // Convert database settings to object format
            const emailSettings: Record<string, any> = {};
            settings.forEach(setting => {
                try {
                    const parsedValue = JSON.parse(setting.value);
                    emailSettings[setting.key] = parsedValue;
                } catch (error) {
                    emailSettings[setting.key] = setting.value;
                }
            });

            // Update from email and name if they exist in settings
            if (emailSettings.fromEmail) {
                this.fromEmail = emailSettings.fromEmail;
            }
            if (emailSettings.fromName) {
                this.fromName = emailSettings.fromName;
            }

            this.settingsLoaded = true;
            console.log('📧 Email settings loaded:', {
                fromEmail: this.fromEmail,
                fromName: this.fromName
            });
        } catch (error) {
            console.error('❌ Failed to load email settings:', error);
            // Keep using default values if loading fails
        }
    }

    // Refresh settings (useful when settings are updated)
    async refreshSettings(): Promise<void> {
        await this.loadEmailSettings();
    }

    async sendEmail(emailData: EmailData): Promise<EmailResult[]> {
        // Load settings from database if not already loaded
        if (!this.settingsLoaded) {
            await this.loadEmailSettings();
        }

        const { recipients } = emailData;
        const totalEmails = recipients.length;

        console.log(`📧 Starting email campaign: ${totalEmails} emails`);
        console.log(`📧 From: ${this.fromName} <${this.fromEmail}>`);

        // Initialize progress tracking
        const progress: BatchProgress = {
            totalEmails,
            processedEmails: 0,
            currentBatch: 0,
            totalBatches: 0,
            successCount: 0,
            errorCount: 0,
            isComplete: false
        };

        try {
            let results: EmailResult[] = [];

            if (totalEmails >= this.batchConfig.batchThreshold) {
                console.log(`🚀 Large campaign detected (${totalEmails} emails). Using smart batching...`);
                results = await this.sendBatchedEmails(emailData, progress);
            } else {
                console.log(`⚡ Small campaign (${totalEmails} emails). Using parallel processing...`);
                results = await this.sendParallelEmails(emailData, progress);
            }

            // Final progress update
            progress.isComplete = true;
            progress.processedEmails = totalEmails;
            this.updateProgress(progress);

            console.log(`✅ Email campaign completed: ${progress.successCount} successful, ${progress.errorCount} failed`);
            return results;

        } catch (error) {
            console.error('❌ Email campaign failed:', error);
            progress.isComplete = true;
            this.updateProgress(progress);
            throw error;
        }
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

    // Smart batching system for large campaigns
    private async sendBatchedEmails(emailData: EmailData, progress: BatchProgress): Promise<EmailResult[]> {
        const { recipients, names, contacts } = emailData;
        const batches = this.createBatches(recipients, this.batchConfig.batchSize);
        const results: EmailResult[] = [];

        progress.totalBatches = batches.length;
        this.updateProgress(progress);

        console.log(`📦 Processing ${batches.length} batches of ${this.batchConfig.batchSize} emails each...`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            progress.currentBatch = i + 1;

            console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} emails)...`);

            try {
                const batchResults = await this.processBatch(batch, names, emailData, contacts, i);
                results.push(...batchResults);

                // Update progress
                progress.processedEmails += batch.length;
                progress.successCount += batchResults.filter(r => r.success).length;
                progress.errorCount += batchResults.filter(r => !r.success).length;
                this.updateProgress(progress);

                console.log(`✅ Batch ${i + 1} completed: ${batchResults.filter(r => r.success).length} successful, ${batchResults.filter(r => !r.success).length} failed`);

                // Rate limiting between batches (except for the last batch)
                if (i < batches.length - 1) {
                    await this.delay(1000); // Wait 1 second between batches
                }

            } catch (error) {
                console.error(`❌ Batch ${i + 1} failed:`, error);

                // Retry failed batch
                const retryResults = await this.retryBatch(batch, names, emailData, contacts, i);
                results.push(...retryResults);

                // Update progress with retry results
                progress.processedEmails += batch.length;
                progress.successCount += retryResults.filter(r => r.success).length;
                progress.errorCount += retryResults.filter(r => !r.success).length;
                this.updateProgress(progress);
            }
        }

        return results;
    }

    // Parallel processing for small campaigns
    private async sendParallelEmails(emailData: EmailData, progress: BatchProgress): Promise<EmailResult[]> {
        const { recipients, names, contacts } = emailData;
        const results: EmailResult[] = [];

        console.log(`⚡ Processing ${recipients.length} emails in parallel with rate limiting...`);

        // Process emails with rate limiting
        const promises = recipients.map(async (recipient, index) => {
            // Rate limiting: delay each email based on the rate limit
            const delay = index * (1000 / this.batchConfig.rateLimit);
            await this.delay(delay);

            const result = await this.sendSingleEmail(recipient, names[index], emailData, contacts);

            // Update progress
            progress.processedEmails++;
            if (result.success) {
                progress.successCount++;
            } else {
                progress.errorCount++;
            }
            this.updateProgress(progress);

            return result;
        });

        return await Promise.all(promises);
    }

    // Process a single batch of emails
    private async processBatch(
        batch: string[],
        names: string[],
        emailData: EmailData,
        contacts: any[] | undefined,
        batchIndex: number
    ): Promise<EmailResult[]> {
        const batchResults: EmailResult[] = [];

        // Process batch in parallel with controlled concurrency
        const concurrency = Math.min(10, batch.length); // Max 10 concurrent emails per batch
        const chunks = this.createBatches(batch, concurrency);

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(async (recipient, chunkIndex) => {
                const globalIndex = batchIndex * this.batchConfig.batchSize + chunkIndex;
                return await this.sendSingleEmail(recipient, names[globalIndex], emailData, contacts);
            });

            const chunkResults = await Promise.all(chunkPromises);
            batchResults.push(...chunkResults);

            // Small delay between chunks to prevent overwhelming the API
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await this.delay(100);
            }
        }

        return batchResults;
    }

    // Retry failed batch with exponential backoff
    private async retryBatch(
        batch: string[],
        names: string[],
        emailData: EmailData,
        contacts: any[] | undefined,
        batchIndex: number
    ): Promise<EmailResult[]> {
        console.log(`🔄 Retrying batch ${batchIndex + 1}...`);

        for (let attempt = 1; attempt <= this.batchConfig.maxRetries; attempt++) {
            try {
                console.log(`🔄 Retry attempt ${attempt}/${this.batchConfig.maxRetries} for batch ${batchIndex + 1}`);

                // Exponential backoff delay
                const delay = this.batchConfig.retryDelay * Math.pow(2, attempt - 1);
                await this.delay(delay);

                const results = await this.processBatch(batch, names, emailData, contacts, batchIndex);

                const successCount = results.filter(r => r.success).length;
                if (successCount > 0) {
                    console.log(`✅ Batch ${batchIndex + 1} retry successful: ${successCount}/${batch.length} emails sent`);
                    return results;
                }

            } catch (error) {
                console.error(`❌ Batch ${batchIndex + 1} retry attempt ${attempt} failed:`, error);
            }
        }

        console.error(`❌ Batch ${batchIndex + 1} failed after ${this.batchConfig.maxRetries} retries`);

        // Return failed results for all emails in the batch
        return batch.map((recipient, index) => ({
            success: false,
            error: 'Batch failed after maximum retries',
            recipient
        }));
    }

    // Send a single email with full error handling
    private async sendSingleEmail(
        recipient: string,
        name: string,
        emailData: EmailData,
        contacts: any[] | undefined
    ): Promise<EmailResult> {
        try {
            // Find the contact data for this recipient
            const contact = contacts?.find(c => c.email === recipient);

            // Create email log first to get the ID for tracking
            const emailLog = await this.createEmailLog(
                recipient,
                name,
                emailData.subject,
                emailData.content,
                emailData.campaignId,
                emailData.isTestEmail
            );

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

            return {
                success: true,
                messageId: response.MessageId,
                recipient,
            };

        } catch (error) {
            console.error(`❌ Failed to send email to ${recipient}:`, error);

            // Log failed send
            await this.logEmailStatus(
                recipient,
                name,
                emailData.subject,
                emailData.content,
                'FAILED',
                undefined,
                error instanceof Error ? error.message : 'Unknown error'
            );

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                recipient,
            };
        }
    }

    // Utility methods
    private createBatches<T>(items: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private updateProgress(progress: BatchProgress): void {
        if (this.progressCallback) {
            this.progressCallback(progress);
        }
    }
}

export const emailService = new EmailService();
