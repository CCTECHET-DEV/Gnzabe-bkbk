export const verifyOtpByEmailContent = (otp: string) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: sans-serif; padding: 20px; background-color: #ffffff; color: #333;">
      <h2>Login Verification - Gnezabe Security Training 🔐</h2>
      <p>We detected a login attempt to your Gnezabe Security Training account.</p>
      <p>If this was you, please use the verification code below to complete your login:</p>
      <p style="text-align: center; margin: 30px 0;">
        <span style="
          background-color: #f4f4f4;
          color: #21C453;
          font-size: 24px;
          padding: 16px 32px;
          border-radius: 6px;
          font-weight: bold;
          letter-spacing: 4px;
          display: inline-block;
        ">${otp}</span>
      </p>
      <p style="color: #777; font-size: 14px;">
        If you did not attempt to log in, we recommend securing your account immediately by resetting your password.
      </p>
      <p>
        Stay secure,<br />
        <strong>The Gnezabe Security Training Team</strong>
      </p>
    </body>
  </html>
`;

export const verifyOtpByEmailSubject = `Verify Your Email for Gnezabe Security Training`;

export const verifyOtpByEmailSender = {
  name: 'Gnezabe Security Training',
  email: 'eyihalem.cctechet@gmail.com',
};
