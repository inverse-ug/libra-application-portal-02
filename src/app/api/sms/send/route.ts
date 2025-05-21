// app/api/sms/send/route.ts
import { NextResponse } from "next/server";
import AfricasTalking from "africastalking";

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!,
});

export async function POST(request: Request) {
  const { phoneNumber, message } = await request.json();

  try {
    const response = await africastalking.SMS.send({
      to: [phoneNumber],
      message: `Libra Institute: ${message}\nReply STOP to opt out`,
      from: process.env.AFRICASTALKING_SENDER_ID || "LIBRA",
    });

    console.log("SMS API Response:", response);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SMS API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
