import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // Mock language detection for now
    const languages = ['en', 'pt', 'es', 'ru', 'tr', 'fr'];
    const randomLanguage = languages[Math.floor(Math.random() * languages.length)];

    return NextResponse.json({ language: randomLanguage });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to detect language' }, { status: 500 });
  }
}