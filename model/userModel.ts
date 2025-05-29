import { Document, Types, Schema, model } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "employee" | "departmentAdmin";
  companyId: string;
  departmentId: string;
  isApproved: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  failedLoginAttempts: number;
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  assignedCourses: Types.ObjectId[];
  progress: {
    [courseId: string]: {
      completed: boolean;
      score?: number;
      lastAccessed?: Date;
    };
  };
  certifications: {
    courseId: Types.ObjectId;
    certificateUrl: string;
    awardedAt: Date;
  }[];
  badges: {
    badgeId: Types.ObjectId;
    awardedAt: Date;
  }[];
  examResults: {
    courseId: Types.ObjectId;
    quizScores: number[];
    simulationScores: number[];
  }[];

  // DepartmentAdmin-only fields
  managedEmployees?: Types.ObjectId[];
  preferences: {
    theme: "light" | "dark";
    language: "am" | "en" | "om" | "tg";
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
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
    role: {
      type: String,
      enum: ["employee", "departmentAdmin"],
      required: true,
    },
    companyId: {
      type: String,
      required: true,
      ref: "Company",
    },
    departmentId: {
      type: String,
      required: true,
      ref: "Department",
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
    assignedCourses: [{ type: Types.ObjectId, ref: "Course" }],
    progress: {
      type: Map,
      of: new Schema(
        {
          completed: { type: Boolean, required: true },
          score: { type: Number },
          lastAccessed: { type: Date },
        },
        { _id: false }
      ),
    },
    certifications: [
      {
        courseId: { type: Types.ObjectId, ref: "Course" },
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
          ref: "Course",
        },
        quizScores: [Number],
        simulationScores: [Number],
      },
    ],
    managedEmployees: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["am", "en", "om", "tg"],
        default: "am",
      },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

export default model<IUser>("User", UserSchema);
