import { Worker } from 'bullmq';
import { EmailSender } from '../services/email.service';

import {
  verifySubject,
  verifySender,
  verifyContent,
} from '../views/email/verifyEmaiil';
import {
  resetPasswordContent,
  resetPasswordSender,
  resetPasswordSubject,
} from '../views/email/passwordResetEmail';
import {
  verifyOtpByEmailContent,
  verifyOtpByEmailSender,
  verifyOtpByEmailSubject,
} from '../views/email/sendOTPEmail';
import {
  approvalRequestContent,
  approvalRequestSender,
  approvalRequestSubject,
} from '../views/email/approveEmployeeRequest';

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

const worker = new Worker(
  'emailQueue',
  async (job) => {
    const {
      type,
      to,
      url,
      otp,
      departmentAdminName,
      employeeEmail,
      employeeName,
    } = job.data;

    let mailer;

    switch (type) {
      case 'verify':
        mailer = new EmailSender({
          subject: verifySubject,
          sender: verifySender,
          htmlContent: verifyContent(url),
          to: [to],
        });
        break;
      case 'reset':
        mailer = new EmailSender({
          subject: resetPasswordSubject,
          sender: resetPasswordSender,
          htmlContent: resetPasswordContent(url),
          to: [to],
        });
        break;
      case 'otp':
        mailer = new EmailSender({
          subject: verifyOtpByEmailSubject,
          sender: verifyOtpByEmailSender,
          htmlContent: verifyOtpByEmailContent(otp),
          to: [to],
        });
        break;
      case 'approval':
        mailer = new EmailSender({
          subject: approvalRequestSubject,
          sender: approvalRequestSender,
          htmlContent: approvalRequestContent(
            departmentAdminName,
            employeeEmail,
          ),
          to: [{ email: to.email, name: employeeName }],
        });
        break;
      default:
        throw new Error('Unknown email type');
    }

    const result = await mailer.send();
    console.log(`Email sent to ${to.email} for type ${type}`);
    return result;
  },
  {
    connection,
  },
);
export default worker;
