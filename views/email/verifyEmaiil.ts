export const verifyContent = (link: string) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: sans-serif; padding: 20px; background-color: #ffffff; color: #333;">
      <h2>Welcome to Gnezabe Security Training 🎉</h2>
      <p>Thank you for signing up! You're just one step away from accessing our specialized security training platform.</p>
      <p>Click the button below to verify your email address and start your journey:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="
          background-color: #21C453;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          display: inline-block;
        ">Verify Email</a>
      </p>
      <p style="color: #777; font-size: 14px;">
        If you didn't sign up for Gnezabe Security Training, you can safely ignore this message.
      </p>
      <p>
        Stay safe,<br />
        <strong>The Gnezabe Security Training Team</strong>
      </p>
    </body>
  </html>
`;

export const verifySubject = `Verify Your Email for Gnezabe Security Training`;

export const verifySender = {
  name: 'Gnezabe Security Training',
  email: 'eyihalem.cctechet@gmail.com',
};
