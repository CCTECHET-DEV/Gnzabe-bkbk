import mongoose, { Document, Schema } from "mongoose";

// TypeScript interface for PlatformOwner
export interface IPlatformOwner extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isVerified: boolean;
  isApproved: boolean;
  accountStatus: "active" | "inactive" | "locked";
  twoFactor: {
    enabled: boolean;
    lastOTP?: {
      code: string;
      expiresAt: Date;
    };
  };
  preferences: {
    theme: "light" | "dark";
    language: "am" | "en" | "om" | "ti";
    notifications: {
      critical: boolean;
      nonCritical: boolean;
    };
  };
  auditLogs: {
    action: string;
    timestamp: Date;
    metadata?: any;
  }[];
  createdAt: Date;
}

// Mongoose schema definition
const platformOwnerSchema = new Schema<IPlatformOwner>(
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
      match: /^\+?[1-9]\d{1,14}$/,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "locked"],
      default: "inactive",
    },
    twoFactor: {
      enabled: { type: Boolean, default: true },
      lastOTP: {
        code: String,
        expiresAt: Date,
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      language: {
        type: String,
        enum: ["am", "en", "om", "ti"],
        default: "am",
      },
      notifications: {
        critical: {
          type: Boolean,
          default: true,
        },
        nonCritical: {
          type: Boolean,
          default: true,
        },
      },
    },
    auditLogs: [
      {
        action: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        metadata: Schema.Types.Mixed,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const PlatformOwner = mongoose.model<IPlatformOwner>(
  "PlatformOwner",
  platformOwnerSchema
);

export default PlatformOwner;
