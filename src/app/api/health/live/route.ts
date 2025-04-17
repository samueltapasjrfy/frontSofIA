import { NextResponse } from 'next/server';

export const runtime = 'edge';    // resposta ultrarrápida e barata
export const revalidate = 0;      // sem cache em ISR

export function GET() {
    return NextResponse.json({ status: 'live' }, { status: 200 });
}

// HEAD tb é útil p/ ALB e Google Cloud LB
export const HEAD = GET;