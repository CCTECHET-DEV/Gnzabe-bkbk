import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ICompany } from '../interfaces/companyInterface';
import { localConnection } from '../config/dbConfig';

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    primaryEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },

    secondaryEmail: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      validate: {
        validator: function (this: ICompany, value: string) {
          return value !== this.primaryEmail;
        },
        message: 'Secondary email must be different from primary email',
      },
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\+?[1-9]\d{1,14}$/, // E.164 format
    },
    logo: {
      type: String,
      default: 'default-logo.png', // Default logo if not provided
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Exclude password from queries by default
      validate: {
        validator: function (value: string) {
          return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/.test(
            value,
          );
        },
        message:
          'Password must be at least 8 characters long and include at least one letter, one number, and one special character (e.g., !@#$%)',
      },
    },
    passwordConfirm: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
      validate: {
        validator: function (this: ICompany, value: string) {
          return value === this.password;
        },
        message: 'Password confirmation does not match password',
      },
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    mfaEnabled: {
      type: Boolean,
      default: true,
    },
    mfaBy: {
      type: String,
      enum: ['email', 'sms', 'authenticator'],
      default: 'email',
      required: true,
    },
    passwordChangedAt: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },

    failedLoginAttemptsMade: {
      type: Number,
      default: 0,
      max: 3,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },

    departments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],

    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      language: {
        type: String,
        enum: ['am', 'en', 'om', 'tg'],
        default: 'am',
      },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);
companySchema.pre('save', async function (this: ICompany, next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});

companySchema.pre(
  'save',
  function (
    this: ICompany & {
      passwordChangedAt: Date;
      isModified: (field: string) => boolean;
    },
    next,
  ) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = new Date(Date.now() - 1000);
    next();
  },
);

companySchema.methods.resetFailedLoginAttemptsMade = async function () {
  this.failedLoginAttemptsMade = 0;
};

companySchema.methods.incrementFailedLoginAttemptsMade = async function () {
  if (this.failedLoginAttemptsMade < 3) {
    this.failedLoginAttemptsMade += 1;
  } else {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
};
companySchema.methods.isPasswordCorrect = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

companySchema.methods.passwordChangedAfter = function (
  JWTTimeStamp: number,
): boolean {
  if (!this.passwordChangedAt) return false;
  const passwordChangedAtStamp = this.passwordChangedAt.getTime() / 1000;
  return passwordChangedAtStamp > JWTTimeStamp;
};

companySchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;
  console.log(resetToken, this.resetPasswordTokenExpiry);
  return resetToken;
};
companySchema.methods.createVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  console.log(verificationToken);
  return verificationToken;
};

// const Company = model<ICompany>('Company', companySchema);

const Company = localConnection.model<ICompany>('Company', companySchema);

export default Company;

console.log('Company model created successfully on local connection');
