import { Types, Schema, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { IUser } from '../interfaces/userInterface';
import { localConnection } from '../config/dbConfig';

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\+?[1-9]\d{1,14}$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
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
      minLegth: 8,
      validate: {
        validator: function (value: string) {
          return value === this.password;
        },
        message: 'Password confirmation does not match password',
      },
    },
    passwordChangedAt: Date,
    photo: {
      type: String,
      required: true,
      default: 'default.jpg',
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
    role: {
      type: String,
      enum: ['employee', 'departmentAdmin'],
      default: 'employee',
      required: true,
    },
    companyId: {
      type: String,
      required: true,
      ref: 'Company',
    },
    departmentId: {
      type: String,
      required: true,
      ref: 'Department',
    },
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
      default: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    isApproved: {
      type: Boolean,
    },
    assignedCourses: [{ type: Types.ObjectId, ref: 'Course' }],
    progress: {
      type: Map,
      of: new Schema(
        {
          completed: { type: Boolean, required: true },
          score: { type: Number },
          lastAccessed: { type: Date },
        },
        { _id: false },
      ),
    },
    certifications: [
      {
        courseId: { type: Types.ObjectId, ref: 'Course' },
        certificateUrl: String,
        awardedAt: Date,
      },
    ],
    badges: [
      {
        badgeId: {
          type: Types.ObjectId,
        },
        awardedAt: Date,
      },
    ],
    examResults: [
      {
        courseId: {
          type: Types.ObjectId,
          ref: 'Course',
        },
        quizScores: [Number],
        simulationScores: [Number],
      },
    ],
    managedEmployees: [
      {
        type: Types.ObjectId,
        ref: 'User',
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema.virtual('isLocked').get(function () {
  return (
    this.accountLockedUntil && this.accountLockedUntil.getTime() > Date.now()
  );
});

userSchema.virtual('hasOTPExpired').get(function () {
  return this.otpExpiry && this.otpExpiry.getTime() > Date.now();
});

userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(
  'save',
  function (
    this: IUser & {
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

userSchema.methods.passwordChangedAfter = function (
  JWTTimeStamp: number,
): boolean {
  if (!this.passwordChangedAt) return false;
  const passwordChangedAtStamp = this.passwordChangedAt.getTime() / 1000;
  return passwordChangedAtStamp > JWTTimeStamp;
};

userSchema.methods.resetFailedLoginAttemptsMade = async function () {
  this.failedLoginAttemptsMade = 0;
};

// Decrement failedLoginAttempts by 1, down to the min (0)
userSchema.methods.incrementFailedLoginAttemptsMade = async function () {
  if (this.failedLoginAttemptsMade < 3) {
    this.failedLoginAttemptsMade += 1;
  } else {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
};

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (
  JWTTimeStamp: number,
): boolean {
  if (!this.passwordChangedAt) return false;
  const passwordChangedAtStamp = this.passwordChangedAt.getTime() / 1000;
  return passwordChangedAtStamp > JWTTimeStamp;
};

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  console.log(resetToken, resetToken);
  return resetToken;
};
userSchema.methods.createVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  this.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
  console.log(verificationToken);
  return verificationToken;
};

// const User: Model<IUser> = localConnection.model<IUser>('User', userSchema);

const User = localConnection.model<IUser>('User', userSchema);

// const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;

console.log('User model created successfully');
