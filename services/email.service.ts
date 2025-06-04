import { Request } from 'express';
import * as brevo from '@getbrevo/brevo';
import {
  verifySubject,
  verifyContent,
  verifySender,
} from '../views/email/verifyEmaiil';
import { removeLastPathSegment } from '../utilities/helper';
import {
  verifyOtpByEmailContent,
  verifyOtpByEmailSender,
  verifyOtpByEmailSubject,
} from '../views/email/sendOTPEmail';

// console.log(brevo, 'brevo');

export class EmailSender {
  subject: string;
  htmlContent: string;
  sender: { email: string; name?: string };
  to: { email: string; name?: string }[];
  apiInstance: brevo.TransactionalEmailsApi;
  sendSmtpEmail: brevo.SendSmtpEmail;

  constructor({
    subject = '',
    htmlContent,
    sender,
    to,
  }: {
    subject: string;
    htmlContent: string;
    sender: { email: string; name?: string };
    to: { email: string; name?: string }[];
  }) {
    this.subject = subject;
    this.htmlContent = htmlContent;
    this.sender = sender;
    this.to = to;
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.sendSmtpEmail = new brevo.SendSmtpEmail();
    this.setApiKey();
  }

  setApiKey() {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!,
    );
  }

  async send() {
    this.sendSmtpEmail.subject = this.subject;
    this.sendSmtpEmail.htmlContent = this.htmlContent;
    this.sendSmtpEmail.sender = {
      email: this.sender.email,
      name: this.sender.name,
    };
    this.sendSmtpEmail.to = this.to.map((recipient) => ({
      email: recipient.email,
      name: recipient.name,
    }));

    const data = await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
    return data;
  }
}

export const sendVerificationEmail = async (
  req: Request,
  email: string,
  id: string,
  token: string,
  name?: string,
): Promise<void> => {
  const protocol = req.protocol; // 'http' or 'https'
  const host = req.get('host'); // 'localhost:3000' or 'yourdomain.com'
  const baseUrl = `${protocol}://${host}${removeLastPathSegment(req.originalUrl)}`;
  const verificationUrl = `${baseUrl}/verify?token=${token}&id=${id}`;

  console.log(verificationUrl, 'verificationUrl');
  // const token = encodeURIComponent(userId);
  const mailer = new EmailSender({
    subject: verifySubject,
    sender: verifySender,
    htmlContent: verifyContent(verificationUrl),
    to: [{ email, name }],
  });

  await mailer.send();
  console.log('Verification email sent to:', email);
};
export const sendOtpEmail = async (
  email: string,
  otp: string,
  name?: string,
): Promise<void> => {
  const mailer = new EmailSender({
    subject: verifyOtpByEmailSubject,
    sender: verifyOtpByEmailSender,
    htmlContent: verifyOtpByEmailContent(otp),
    to: [{ email, name }],
  });

  await mailer.send();
  console.log('OTP has been sent to email: ', email);
};
