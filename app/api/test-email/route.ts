import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { testEmail } = body;

        if (!testEmail) {
            return NextResponse.json(
                { error: "Test email address is required." },
                { status: 400 }
            );
        }

        // Validate email format
        const isValid = await emailService.verifyEmailAddress(testEmail);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email address format." },
                { status: 400 }
            );
        }

        // Send test email
        const results = await emailService.sendEmail({
            recipients: [testEmail],
            names: ['Test User'],
            subject: 'Test Email from Mailway',
            content: `
                <h2>Test Email</h2>
                <p>Hello Test User,</p>
                <p>This is a test email from your Mailway application.</p>
                <p>If you received this email, your AWS SES configuration is working correctly!</p>
                <p>Best regards,<br>Mailway Team</p>
            `,
        });

        const result = results[0];

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Test email sent successfully!",
                messageId: result.messageId,
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                message: "Failed to send test email.",
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Error sending test email:", error);
        return NextResponse.json(
            {
                error: "Failed to send test email.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
