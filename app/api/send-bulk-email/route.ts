import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';

export const dynamic = "force-dynamic";

// Check if email service is configured
function isEmailServiceConfigured(): boolean {
    // Check for common email service environment variables
    const hasSendGrid = process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL;
    const hasMailgun = process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN;
    const hasAWS = process.env.MAILWAY_AWS_ACCESS_KEY_ID && process.env.MAILWAY_AWS_SECRET_ACCESS_KEY && process.env.MAILWAY_AWS_REGION;
    const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    return !!(hasSendGrid || hasMailgun || hasAWS || hasSMTP);
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const progressId = searchParams.get('progressId');

        if (!progressId) {
            return NextResponse.json(
                { error: "Progress ID is required" },
                { status: 400 }
            );
        }

        // For now, return a mock progress response
        // In a real implementation, you'd store progress in a database or cache
        return NextResponse.json({
            progress: {
                totalEmails: 10,
                processedEmails: 5,
                currentBatch: 1,
                totalBatches: 2,
                successCount: 4,
                errorCount: 1,
                isComplete: false  // Keep it false so modal doesn't auto-close
            }
        });

    } catch (error) {
        console.error("Error in GET send-bulk-email API:", error);
        return NextResponse.json(
            {
                error: "Internal server error while fetching progress.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { recipients, names, subject, content, campaignId, batchSize = 50 } = body;

        // Validate required fields
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json(
                { error: "Recipients array is required and must not be empty." },
                { status: 400 }
            );
        }

        if (!subject || !content) {
            return NextResponse.json(
                { error: "Subject and content are required." },
                { status: 400 }
            );
        }

        // Validate names array matches recipients array
        if (!names || !Array.isArray(names) || names.length !== recipients.length) {
            return NextResponse.json(
                { error: "Names array is required and must match the length of recipients array." },
                { status: 400 }
            );
        }

        // Check if email service is configured
        if (!isEmailServiceConfigured()) {
            return NextResponse.json(
                {
                    error: "Email service not configured",
                    message: "No email service is configured. Please set up SendGrid, Mailgun, AWS SES, or SMTP credentials in your environment variables.",
                    details: {
                        requiredEnvVars: {
                            sendgrid: ["SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL"],
                            mailgun: ["MAILGUN_API_KEY", "MAILGUN_DOMAIN"],
                            aws: ["MAILWAY_AWS_ACCESS_KEY_ID", "MAILWAY_AWS_SECRET_ACCESS_KEY", "MAILWAY_AWS_REGION"],
                            smtp: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]
                        }
                    }
                },
                { status: 503 } // Service Unavailable
            );
        }

        console.log('Bulk email sending request:', {
            totalRecipients: recipients.length,
            subject,
            content: content.substring(0, 100) + '...',
            batchSize,
            campaignId,
            timestamp: new Date().toISOString()
        });

        // Validate email addresses
        const validRecipients = [];
        const validNames = [];
        const invalidEmails = [];

        for (let i = 0; i < recipients.length; i++) {
            const email = recipients[i];
            const isValid = await emailService.verifyEmailAddress(email);

            if (isValid) {
                validRecipients.push(email);
                validNames.push(names[i] || 'Valued Customer');
            } else {
                invalidEmails.push(email);
            }
        }

        if (validRecipients.length === 0) {
            return NextResponse.json(
                {
                    error: "No valid email addresses",
                    message: "All provided email addresses are invalid.",
                    details: {
                        invalidEmails,
                        totalRecipients: recipients.length
                    }
                },
                { status: 400 }
            );
        }

        // Fetch full contact data for personalization - only contacts with valid emails
        const contacts = await prisma.contact.findMany({
            where: {
                email: {
                    in: validRecipients
                },
                emailValidated: true
            }
        });

        console.log('Fetched contacts for personalization:', contacts.map(c => ({
            email: c.email,
            name: c.name,
            company: c.company,
            phone: c.phone,
            tags: c.tags
        })));

        // Set up progress tracking
        let progressCallback: ((progress: any) => void) | undefined;

        // If this is a large campaign, set up progress tracking
        if (validRecipients.length >= 100) {
            progressCallback = (progress: any) => {
                console.log(`📊 Bulk email progress: ${progress.processedEmails}/${progress.totalEmails} (${Math.round((progress.processedEmails / progress.totalEmails) * 100)}%) - ${progress.successCount} successful, ${progress.errorCount} failed`);
            };
            emailService.setProgressCallback(progressCallback);
        }

        // Send emails using the email service with bulk optimization
        console.log(`📧 Starting bulk email campaign: ${validRecipients.length} emails`);

        const emailResults = await emailService.sendEmail({
            recipients: validRecipients,
            names: validNames,
            subject,
            content,
            campaignId,
            contacts: contacts, // Pass full contact data
        });

        // Count successful and failed sends
        const successfulSends = emailResults.filter(result => result.success);
        const failedSends = emailResults.filter(result => !result.success);

        console.log(`✅ Bulk email campaign completed: ${successfulSends.length} successful, ${failedSends.length} failed`);

        // Clear progress callback
        emailService.setProgressCallback(() => { });

        // Return results
        return NextResponse.json(
            {
                success: true,
                message: `Bulk emails sent successfully to ${successfulSends.length} recipient(s)`,
                details: {
                    totalRecipients: recipients.length,
                    validRecipients: validRecipients.length,
                    successfulSends: successfulSends.length,
                    failedSends: failedSends.length,
                    invalidEmails,
                    batchSize,
                    results: emailResults
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error in send-bulk-email API:", error);
        return NextResponse.json(
            {
                error: "Internal server error while processing bulk email request.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}