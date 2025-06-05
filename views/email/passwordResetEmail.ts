export const resetPasswordContent = (link: string) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: sans-serif; padding: 20px; background-color: #ffffff; color: #333;">
      <h2>Password Reset Request 🔐</h2>
      <p>We received a request to reset your password for your Gnezabe Security Training account.</p>
      <p>Click the button below to choose a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="
          background-color: #21C453;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
        ">Reset Password</a>
      </p>
      <p style="color: #777; font-size: 14px;">
        If you didn't request a password reset, you can safely ignore this email. This link will expire in 10 minutes for your security.
      </p>
      <p>
        Stay secure,<br />
        <strong>The Gnezabe Security Training Team</strong>
      </p>
    </body>
  </html>
`;

export const resetPasswordSubject = `Reset Your Password - Gnezabe Security Training`;

export const resetPasswordSender = {
  name: 'Gnezabe Security Training',
  email: 'eyihalem.cctechet@gmail.com',
};
