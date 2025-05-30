import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ICompany } from '../interfaces/companyInterface';

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

    failedLoginAttempts: {
      type: Number,
      default: 0,
      max: 5,
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

export const Company = model<ICompany>('Company', companySchema);
