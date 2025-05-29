import { Types, Schema, model } from "mongoose";
import { ICompany } from "../middlewares/companyInterface";

const CompanySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true, trim: true },

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

    password: {
      type: String,
      required: true,
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
        ref: "Department",
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
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

export const Company = model<ICompany>("Company", CompanySchema);
