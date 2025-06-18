export const approvalRequestContent = (
  departmentAdminName: string,
  employeeEmail: string,
) => `
  <!DOCTYPE html>
  <html>
    <body style="font-family: sans-serif; padding: 20px; background-color: #ffffff; color: #333;">
      <h2>Employee Registration Pending Approval</h2>
      <p>Dear ${departmentAdminName},</p>
      <p>We would like to inform you that an employee with the email address <strong>${employeeEmail}</strong> has registered on the Gnezabe Security Training Platform and is requesting to join your department.</p>
      <p>Please log in to your admin dashboard to review and approve the registration request.</p>
      <p style="margin-top: 20px;">
        Kindly take a moment to process this request at your earliest convenience.
      </p>
      <p style="color: #777; font-size: 14px;">
        If you were not expecting this request or need assistance, please contact our support team.
      </p>
      <p>
        Thank you for helping us maintain a secure and efficient platform.<br/>
        <strong>The Gnezabe Security Training Team</strong>
      </p>
    </body>
  </html>
`;

export const approvalRequestSubject = `Approval Needed: Employee Registration Pending`;

export const approvalRequestSender = {
  name: 'Gnezabe Security Training',
  email: 'eyihalem.cctechet@gmail.com',
};
