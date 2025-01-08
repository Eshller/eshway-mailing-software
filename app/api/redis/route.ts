import { NextResponse } from 'next/server';
import { Redis } from 'ioredis';

const client = new Redis(process.env.REDIS_URL!);

client.on('error', (err) => console.error('Redis Client Error', err));

client.connect();

export async function GET() {
    return NextResponse.json({ message: 'Redis client connected' });
}