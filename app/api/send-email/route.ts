import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { emailService } from '@/lib/email-service';

export const dynamic = "force-dynamic";

// Check if email service is configured
function isEmailServiceConfigured(): boolean {
    // Check for common email service environment variables
    const hasSendGrid = process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL;
    const hasMailgun = process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN;
    const hasAWS = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION;
    const hasSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

    return !!(hasSendGrid || hasMailgun || hasAWS || hasSMTP);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { recipients, name, subject, content, campaignId } = body;

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
                            aws: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"],
                            smtp: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"]
                        }
                    }
                },
                { status: 503 } // Service Unavailable
            );
        }

        // Log the email request for debugging
        console.log('Email sending request:', {
            recipients,
            names: name,
            subject,
            content: content.substring(0, 100) + '...',
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
                validNames.push(name[i] || 'Valued Customer');
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

        // Send emails using the email service
        console.log(`Sending emails to ${validRecipients.length} valid recipients...`);

        const emailResults = await emailService.sendEmail({
            recipients: validRecipients,
            names: validNames,
            subject,
            content,
            campaignId,
        });

        // Count successful and failed sends
        const successfulSends = emailResults.filter(result => result.success);
        const failedSends = emailResults.filter(result => !result.success);

        console.log(`Email sending completed: ${successfulSends.length} successful, ${failedSends.length} failed`);

        // Return results
        return NextResponse.json(
            {
                success: true,
                message: `Emails sent successfully to ${successfulSends.length} recipient(s)`,
                details: {
                    totalRecipients: recipients.length,
                    validRecipients: validRecipients.length,
                    successfulSends: successfulSends.length,
                    failedSends: failedSends.length,
                    invalidEmails,
                    results: emailResults
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error in send-email API:", error);
        return NextResponse.json(
            {
                error: "Internal server error while processing email request.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
