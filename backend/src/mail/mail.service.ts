import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Resend } from "resend";
import * as QRCode from "qrcode";

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendRegistrationConfirmation(
    email: string,
    name: string,
    eventTitle: string,
    qrToken: string,
  ) {
    try {
      const qrCode = await QRCode.toBuffer(qrToken, {
        type: "png",
        width: 500,
        margin: 2,
      });
      const { error } = await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to: [email],
        subject: `Registration confirmed - ${eventTitle}`,
        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
            "
          >
            <h1>Registration Confirmed 🎉</h1>

            <p>Hi ${name},</p>

            <p>
              Your registration for
              <strong>${eventTitle}</strong>
              has been confirmed.
            </p>

            <p>
              Please keep this email and show the QR code below
              when you arrive at the event.
            </p>

            <p>
              This QR code will be used to check you in at the event.
            </p>

            <p>
              See you there!
            </p>
          </div>`,
        attachments: [{ filename: "registration-qr.png", content: qrCode }],
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch {
      throw new InternalServerErrorException(
        "Failed to send registration email",
      );
    }
  }
}
