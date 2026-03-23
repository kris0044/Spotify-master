import { axiosInstance } from "@/lib/axios";
import { Notification } from "@/types";
import { create } from "zustand";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";

interface NotificationStore {
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	socketBound: boolean;
	fetchNotifications: () => Promise<void>;
	markRead: (id: string) => Promise<void>;
	bindSocket: () => void;
	reset: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
	notifications: [],
	unreadCount: 0,
	isLoading: false,
	socketBound: false,

	fetchNotifications: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/users/me/notifications");
			set({
				notifications: response.data.notifications,
				unreadCount: response.data.unreadCount,
			});
		} catch (error: any) {
			if (error.response?.status !== 401) {
				toast.error(error.response?.data?.message || "Failed to load notifications");
			}
		} finally {
			set({ isLoading: false });
		}
	},

	markRead: async (id) => {
		try {
			const response = await axiosInstance.post(`/users/me/notifications/${id}/read`);
			set((state) => {
				const notifications = state.notifications.map((item) => (item._id === id ? response.data : item));
				return {
					notifications,
					unreadCount: notifications.filter((item) => !item.isRead).length,
				};
			});
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to mark notification as read");
		}
	},

	bindSocket: () => {
		const { socket } = useChatStore.getState();
		if (!socket || useNotificationStore.getState().socketBound) {
			return;
		}

		socket.off("notification:new");
		socket.on("notification:new", (notification: Notification) => {
			set((state) => ({
				notifications: [notification, ...state.notifications],
				unreadCount: state.unreadCount + 1,
			}));
			toast(notification.title);
		});

		set({ socketBound: true });
	},

	reset: () => {
		const { socket } = useChatStore.getState();
		socket?.off("notification:new");
		set({
			notifications: [],
			unreadCount: 0,
			isLoading: false,
			socketBound: false,
		});
	},
}));
