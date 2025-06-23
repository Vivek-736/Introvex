import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyA09Heo4lvW8gxAib3i8QaYihnkW9ZzgTI`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const botResponse = data.candidates[0]?.content?.parts[0]?.text || 'No response';
    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error('Error fetching Gemini API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}