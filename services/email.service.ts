import * as brevo from '@getbrevo/brevo';

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
