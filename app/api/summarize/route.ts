// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   try {
//     const { text } = await req.json();

//     // Mock summarization for now
//     const summary = text.split(' ').slice(0, 10).join(' ') + '...';

//     return NextResponse.json({ summary });
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const summarizerApiToken = process.env.NEXT_PUBLIC_SUMMARIZER_API_TOKEN;

    if (!summarizerApiToken) {
      return NextResponse.json({ error: "Missing API Token" }, { status: 500 });
    }

    const apiUrl = 'THE_ACTUAL_SUMMARIZER_API_ENDPOINT';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${summarizerApiToken}`,
      },
      body: JSON.stringify({
        text: text,

      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Summarization API Error:", errorData);
      return NextResponse.json({ error: `Summarization failed: ${response.status} - ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    const summary = data.summary;

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in summarize route:", error);
    return NextResponse.json({ error: 'Failed to summarize text' }, { status: 500 });
  }
}