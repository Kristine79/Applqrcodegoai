import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { chatId, message } = await req.json();
    const botToken = process.env.NOTIFY_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID || '402396098';

    if (!botToken) {
      return NextResponse.json({ error: 'Notification Bot Token (NOTIFY_BOT_TOKEN) is not configured in Settings -> Secrets' }, { status: 500 });
    }

    const targetChatId = (chatId || adminChatId)?.toString().trim();

    if (!targetChatId) {
      return NextResponse.json({ error: 'Chat ID is missing' }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.description || 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
