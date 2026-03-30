import { NextResponse } from 'next/server';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    const { message, data: rawData } = await request.json();
    
    // If rawData is provided, construct a safe message
    let finalMessage = message;
    if (rawData) {
      finalMessage = `🚗 <b>Новая визитка создана!</b>\n\n` +
        `<b>Авто:</b> ${escapeHtml(rawData.carModel)}\n` +
        `<b>Госномер:</b> ${escapeHtml(rawData.plateNumber)}\n` +
        `<b>Владелец:</b> ${escapeHtml(rawData.ownerName)}\n` +
        `<b>Телефон:</b> ${escapeHtml(rawData.phone1)}\n\n` +
        `<a href="${rawData.url}">Посмотреть визитку</a>`;
    }
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
    const cleanToken = token.toLowerCase().startsWith('bot') ? token.slice(3) : token;

    // Basic Telegram token format validation (e.g., 123456789:ABC...)
    const tokenRegex = /^\d+:[a-zA-Z0-9_-]{35,}$/;
    if (!tokenRegex.test(cleanToken)) {
      console.error('Notification Error: Telegram bot token format is invalid.');
      return NextResponse.json({ 
        error: `Invalid Telegram bot token format. It should look like '123456789:ABC...'. Current masked token: ${cleanToken.slice(0, 4)}...${cleanToken.slice(-4)}` 
      }, { status: 400 });
    }

    // Log masked token for server-side debugging
    console.log(`Attempting to send Telegram message. Token starts with: ${cleanToken.slice(0, 4)}... ends with: ...${cleanToken.slice(-4)}`);

    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: finalMessage || message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      let errorMessage = data.description;
      if (response.status === 404) {
        errorMessage = `Telegram API returned 404 Not Found. This usually means the bot token is invalid. Please check your NOTIFY_BOT_TOKEN environment variable. Current token (masked): ${cleanToken.slice(0, 4)}...${cleanToken.slice(-4)}`;
      }
      console.error('Telegram API Error:', data);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
