import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    
    // Mock summarization for now
    // In a real app, you would integrate with a summarization API
    const summary = text.split(' ').slice(0, 10).join(' ') + '...';
    
    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
}