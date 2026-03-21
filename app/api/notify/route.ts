import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    // Try different common environment variable names
    const token = (
      process.env.NOTIFY_BOT_TOKEN || 
      process.env.TELEGRAM_BOT_TOKEN || 
      process.env.BOT_TOKEN ||
      process.env.NEXT_PUBLIC_NOTIFY_BOT_TOKEN
    )?.trim();

    const chatId = (process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID)?.trim() || '402396098';

    if (!token) {
      console.error('Notification Error: No Telegram token found in environment variables.');
      return NextResponse.json({ error: 'Telegram bot token not configured' }, { status: 500 });
    }

    // Ensure token doesn't start with 'bot' prefix if user accidentally included it
    // Telegram API URL should be .../bot123:ABC/... but the token itself is 123:ABC
    const cleanToken = token.toLowerCase().startsWith('bot') ? token.slice(3) : token;

    // Log masked token for server-side debugging
    console.log(`Attempting to send Telegram message. Token starts with: ${cleanToken.slice(0, 4)}... ends with: ...${cleanToken.slice(-4)}`);

    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
