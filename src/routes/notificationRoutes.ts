import { Router } from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getNotifications);
router.post("/read-all", markAllNotificationsAsRead);
router.post("/:notificationId/read", markNotificationAsRead);

export default router;
