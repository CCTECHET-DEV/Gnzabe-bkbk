import { EmailSender } from './email.service';
import {
  verifySubject,
  verifyContent,
  verifySender,
} from '../views/email/verifyComapnyEmaiil';

export const sendVerificationEmail = async (
  email: string,
  userId: string,
  name?: string,
): Promise<void> => {
  const baseUrl = process.env.CLIENT_URL || 'https://your-frontend-url.com';
  const token = encodeURIComponent(userId); // or a real token
  const link = `${baseUrl}/verify?token=${token}`; // or whatever route you use

  const mailer = new EmailSender({
    subject: verifySubject,
    sender: verifySender,
    htmlContent: verifyContent(link),
    to: [{ email, name }],
  });

  await mailer.send();
};
