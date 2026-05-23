import { apiClient } from "./client";
import type { Notification } from "@/types";

export const notificationsApi = {
  async list(limit = 20, offset = 0): Promise<Notification[]> {
    const r = await apiClient.get("/api/v1/notifications", {
      params: { limit, offset },
    });
    return r.data;
  },

  async unreadCount(): Promise<{ unread: number }> {
    const r = await apiClient.get("/api/v1/notifications/unread-count");
    return r.data;
  },

  async markRead(id: string): Promise<Notification> {
    const r = await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return r.data;
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch("/api/v1/notifications/read-all");
  },
};
