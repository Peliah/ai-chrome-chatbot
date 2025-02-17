import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json();

    // Mock translation for now
    const translation = `[${targetLanguage}] ${text}`;

    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}