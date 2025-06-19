import { NextFunction, Request, Response } from 'express';
import Notification from '../model/notificationModel';
import { catchAsync } from '../utilities/catchAsync';
import { AppError } from '../utilities/appError';
import { Document } from 'mongoose';

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Notification ID is required', 400));
    }

    // Parse page and limit from query, set defaults
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: id,
      isRead: false,
    })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      recipient: id,
      isRead: false,
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
      },
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  },
);

export const markNotificationAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Notification ID is required', 400));
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: notification,
      },
    });
  },
);

export const markAllNotificationsAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Company ID is required', 400));
    }

    const notifications = await Notification.updateMany(
      { recipient: id, isRead: false },
      { isRead: true },
    );

    res.status(200).json({
      status: 'success',
      message: `${notifications.modifiedCount} notifications marked as read`,
    });
  },
);
