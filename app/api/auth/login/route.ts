import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // Hardcoded credentials
        if (username === 'eshu' && password === 'eshu') {
            // In a real app, you'd generate a proper JWT token
            const token = 'hardcoded-token-for-eshu';

            return NextResponse.json({
                success: true,
                token,
                user: { username: 'eshu' }
            });
        }

        return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}


