import { Types, Schema, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../interfaces/userInterface';

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
    failedLoginAttempts: {
      type: Number,
      default: 0,
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

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

userSchema.methods.isPasswordCorrect = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
