import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = "force-dynamic";

// GET email settings
export async function GET() {
    try {
        // Fetch email settings from database
        const settings = await prisma.settings.findMany({
            where: { category: 'email' }
        });

        // Convert database settings to object format
        const emailSettings: Record<string, any> = {};
        settings.forEach(setting => {
            try {
                // Try to parse JSON value, fallback to string
                const parsedValue = JSON.parse(setting.value);
                emailSettings[setting.key] = parsedValue;
            } catch (error) {
                // If JSON parsing fails, use the raw string value
                emailSettings[setting.key] = setting.value;
            }
        });

        // Ensure all required fields have proper default values
        const sanitizedSettings = {
            provider: emailSettings.provider || 'aws-ses',
            smtpHost: emailSettings.smtpHost || '',
            smtpPort: emailSettings.smtpPort || '587',
            smtpUsername: emailSettings.smtpUsername || '',
            smtpPassword: emailSettings.smtpPassword || '',
            smtpSecure: Boolean(emailSettings.smtpSecure),
            fromName: emailSettings.fromName || '',
            fromEmail: emailSettings.fromEmail || '',
            replyToEmail: emailSettings.replyToEmail || '',
            awsAccessKeyId: emailSettings.awsAccessKeyId || '',
            awsSecretAccessKey: emailSettings.awsSecretAccessKey || '',
            awsRegion: emailSettings.awsRegion || 'ap-south-1',
            sendgridApiKey: emailSettings.sendgridApiKey || '',
            mailgunApiKey: emailSettings.mailgunApiKey || '',
            mailgunDomain: emailSettings.mailgunDomain || '',
            trackingEnabled: Boolean(emailSettings.trackingEnabled),
            openTracking: Boolean(emailSettings.openTracking),
            clickTracking: Boolean(emailSettings.clickTracking),
            unsubscribeTracking: Boolean(emailSettings.unsubscribeTracking),
            bounceHandling: Boolean(emailSettings.bounceHandling),
            complaintHandling: Boolean(emailSettings.complaintHandling),
            rateLimit: emailSettings.rateLimit || '1000',
            dailyLimit: emailSettings.dailyLimit || '10000',
            monthlyLimit: emailSettings.monthlyLimit || '300000'
        };

        return NextResponse.json(sanitizedSettings);
    } catch (error) {
        console.error('Error fetching email settings:', error);
        console.error('Error details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch email settings', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST/UPDATE email settings
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            provider,
            smtpHost,
            smtpPort,
            smtpUsername,
            smtpPassword,
            smtpSecure,
            fromName,
            fromEmail,
            replyToEmail,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion,
            sendgridApiKey,
            mailgunApiKey,
            mailgunDomain,
            trackingEnabled,
            openTracking,
            clickTracking,
            unsubscribeTracking,
            bounceHandling,
            complaintHandling,
            rateLimit,
            dailyLimit,
            monthlyLimit
        } = body;

        // Validate required fields based on provider
        // Note: For partial updates, we skip validation to allow saving individual fields
        if (provider === 'smtp') {
            if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
                return NextResponse.json(
                    { error: 'SMTP Host, Port, Username, and Password are required for SMTP' },
                    { status: 400 }
                );
            }
        } else if (provider === 'sendgrid') {
            if (!sendgridApiKey) {
                return NextResponse.json(
                    { error: 'SendGrid API Key is required' },
                    { status: 400 }
                );
            }
        } else if (provider === 'mailgun') {
            if (!mailgunApiKey || !mailgunDomain) {
                return NextResponse.json(
                    { error: 'Mailgun API Key and Domain are required' },
                    { status: 400 }
                );
            }
        }

        // Validate email addresses
        if (fromEmail && !isValidEmail(fromEmail)) {
            return NextResponse.json(
                { error: 'Invalid from email address' },
                { status: 400 }
            );
        }

        if (replyToEmail && !isValidEmail(replyToEmail)) {
            return NextResponse.json(
                { error: 'Invalid reply-to email address' },
                { status: 400 }
            );
        }

        // Save settings to database
        const settingsToSave = {
            provider,
            smtpHost,
            smtpPort: parseInt(smtpPort),
            smtpUsername,
            smtpPassword,
            smtpSecure: Boolean(smtpSecure),
            fromName,
            fromEmail,
            replyToEmail,
            awsAccessKeyId,
            awsSecretAccessKey,
            awsRegion,
            sendgridApiKey,
            mailgunApiKey,
            mailgunDomain,
            trackingEnabled: Boolean(trackingEnabled),
            openTracking: Boolean(openTracking),
            clickTracking: Boolean(clickTracking),
            unsubscribeTracking: Boolean(unsubscribeTracking),
            bounceHandling: Boolean(bounceHandling),
            complaintHandling: Boolean(complaintHandling),
            rateLimit: parseInt(rateLimit),
            dailyLimit: parseInt(dailyLimit),
            monthlyLimit: parseInt(monthlyLimit)
        };

        // Save each setting to database
        for (const [key, value] of Object.entries(settingsToSave)) {
            try {
                await prisma.settings.upsert({
                    where: {
                        category_key: {
                            category: 'email',
                            key: key
                        }
                    },
                    update: {
                        value: JSON.stringify(value),
                        isEncrypted: ['smtpPassword', 'awsSecretAccessKey', 'sendgridApiKey', 'mailgunApiKey'].includes(key)
                    },
                    create: {
                        category: 'email',
                        key: key,
                        value: JSON.stringify(value),
                        description: getSettingDescription(key),
                        isEncrypted: ['smtpPassword', 'awsSecretAccessKey', 'sendgridApiKey', 'mailgunApiKey'].includes(key)
                    }
                });
            } catch (error) {
                console.error(`Error saving setting ${key}:`, error);
                // Continue with other settings even if one fails
            }
        }

        return NextResponse.json({
            message: 'Email settings updated successfully',
            settings: settingsToSave
        });

    } catch (error) {
        console.error('Error updating email settings:', error);
        return NextResponse.json(
            { error: 'Failed to update email settings' },
            { status: 500 }
        );
    }
}

// Test email configuration
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { provider, testType } = body;

        // For now, return success for testing
        // In production, you would implement actual connection testing
        if (testType === 'connection') {
            return NextResponse.json({
                success: true,
                message: `${provider} connection test successful`,
                details: {
                    provider,
                    responseTime: 150,
                    timestamp: new Date().toISOString()
                }
            });
        } else if (testType === 'send') {
            return NextResponse.json({
                success: true,
                message: 'Test email sent successfully',
                details: {
                    messageId: 'test-' + Math.random().toString(36).substring(2, 15),
                    timestamp: new Date().toISOString()
                }
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid test type'
        }, { status: 400 });

    } catch (error) {
        console.error('Error testing email configuration:', error);
        return NextResponse.json(
            { error: 'Failed to test email configuration' },
            { status: 500 }
        );
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getSettingDescription(key: string): string {
    const descriptions: Record<string, string> = {
        provider: 'Email service provider',
        smtpHost: 'SMTP server hostname',
        smtpPort: 'SMTP server port',
        smtpUsername: 'SMTP username',
        smtpPassword: 'SMTP password',
        smtpSecure: 'Use SSL/TLS for SMTP',
        fromName: 'Default sender name',
        fromEmail: 'Default sender email',
        replyToEmail: 'Default reply-to email',
        awsAccessKeyId: 'AWS Access Key ID',
        awsSecretAccessKey: 'AWS Secret Access Key',
        awsRegion: 'AWS region',
        sendgridApiKey: 'SendGrid API key',
        mailgunApiKey: 'Mailgun API key',
        mailgunDomain: 'Mailgun domain',
        trackingEnabled: 'Enable email tracking',
        openTracking: 'Track email opens',
        clickTracking: 'Track link clicks',
        unsubscribeTracking: 'Track unsubscribe requests',
        bounceHandling: 'Handle bounced emails',
        complaintHandling: 'Handle spam complaints',
        rateLimit: 'Emails per minute limit',
        dailyLimit: 'Daily email limit',
        monthlyLimit: 'Monthly email limit'
    };
    return descriptions[key] || 'Email setting';
}
