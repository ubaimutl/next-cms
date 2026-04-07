import { NextRequest, NextResponse } from "next/server";

import { contactSubmissionSchema } from "@/lib/contact";
import { writeStringList } from "@/lib/db-json";
import { sendContactEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSubmissionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { honeypot, ...submission } = validation.data;

    if (honeypot) {
      return NextResponse.json({ status: "ignored" }, { status: 202 });
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: submission.name,
        email: submission.email,
        company: submission.company,
        website: submission.website,
        services: writeStringList(submission.services),
        budget: submission.budget,
        timeline: submission.timeline,
        message: submission.message,
      },
    });

    try {
      await sendContactEmail(submission);

      await prisma.contactMessage.update({
        where: { id: savedMessage.id },
        data: {
          emailSentAt: new Date(),
          emailError: null,
        },
      });

      return NextResponse.json({ status: "sent" }, { status: 201 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to deliver email.";

      await prisma.contactMessage.update({
        where: { id: savedMessage.id },
        data: {
          emailError: message,
        },
      });

      return NextResponse.json(
        {
          status: "saved",
          message:
            "Your message was saved. Email delivery needs attention on the server.",
        },
        { status: 202 },
      );
    }
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      { error: "Failed to submit contact message" },
      { status: 500 },
    );
  }
}
