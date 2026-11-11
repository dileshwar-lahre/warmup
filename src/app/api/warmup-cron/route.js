import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');

    // Security check taaki koi aur tera URL misuse na kar sake
    if (secret !== 'stonenox_secure_warmup_2026') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Predefined 16 target Gmail addresses for automated rotation & warmup
    const targetRecipients = [
      'dileshwarlahre806@gmail.com', 'un30151@gmail.com', 'cginfrax@gmail.com',
      'dhhj9695@gmail.com', 'stonenox82@gmail.com', 'bspcontinental01@gmail.com',
      'bspccontinental@gmail.com', 'alex.stonenoxtech@gmail.com', 'ryan.stonenoxtech@gmail.com',
      'david.stonenoxtech@gmail.com', 'lucas.stonenoxtech@gmail.com', 'sam.stonenoxtech@gmail.com',
      'leo.stonenoxtech@gmail.com', 'max.stonenoxtech@gmail.com', 'noah.stonenoxtech@gmail.com', 'jack.stonenoxtech@gmail.com'
    ];

    // Trigger internal main /api/warmup POST endpoint securely
    const response = await fetch(`${url.origin}/api/warmup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipients: targetRecipients })
    });

    const data = await response.json();
    return NextResponse.json({ success: true, message: 'Autopilot cron batch triggered successfully!', data });

  } catch (error) {
    console.error("CRON TRIGGER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}