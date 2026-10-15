import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "ripaahyarr@gmail.com";
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function validate(payload: ContactPayload) {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || name.length > 100) return { error: "Please enter a valid name." };
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return { error: "Please enter a valid email address." };
  if (!message || message.length > 2000) return { error: "Message must be between 1 and 2000 characters." };

  return { data: { name, email, message } };
}

async function sendNotificationEmail(data: { name: string; email: string; message: string }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn("contact: GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping email notification");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Portfolio Contact Form <${GMAIL_USER}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: data.email,
      subject: `New portfolio message from ${data.name}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });
  } catch (error) {
    console.error("contact: failed to send notification email", error);
  }
}

export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validate(payload);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data } = validated;

  try {
    const sql = getDb();
    await sql`
      insert into contact_messages (name, email, message)
      values (${data.name}, ${data.email}, ${data.message})
    `;
  } catch (error) {
    console.error("contact: failed to store submission", error);
    return NextResponse.json({ error: "Could not save your message. Please try again shortly." }, { status: 500 });
  }

  await sendNotificationEmail(data);

  return NextResponse.json({ ok: true });
}
