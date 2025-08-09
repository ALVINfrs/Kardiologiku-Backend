import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = await Notification.findByUserId(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching notifications" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;
    await Notification.markAsRead(parseInt(notificationId), userId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    await Notification.markAllAsRead(userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
