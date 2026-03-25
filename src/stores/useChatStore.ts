import { axiosInstance } from "@/lib/axios";
import { Message, User, UserCurrentSong } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

interface PresenceSnapshotItem {
	userId: string;
	isOnline: boolean;
	lastSeenAt: string | null;
	activity: string;
	song?: UserCurrentSong | null;
}

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => Promise<void>;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
}

const baseURL = import.meta.env.MODE === "development" ? "https://spotify-master-backend-9di9.onrender.com" : "/";
// const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
});

const applyUserPatch = (users: User[], userId: string, patch: Partial<User>) =>
	users.map((user) => (user.clerkId === userId ? { ...user, ...patch } : user));

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			const normalizedUsers = (response.data as User[]).map((user) => ({
				...user,
				isOnline: Boolean(user.isOnline),
				currentActivity: user.currentActivity || "Idle",
			}));
			set({ users: normalizedUsers });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.off("connect");
			socket.off("disconnect");
			socket.off("connect_error");

			socket.on("connect", () => {
				socket.emit("user_connected", userId, (response: { ok?: boolean; error?: string } = {}) => {
					if (!response.ok && response.error) {
						toast.error(response.error);
						return;
					}

					set({ isConnected: true });
				});
			});

			socket.on("disconnect", () => {
				set({ isConnected: false });
			});

			socket.on("connect_error", (error: Error) => {
				console.error("Socket connection error:", error.message);
				toast.error("Chat connection failed");
				set({ isConnected: false });
			});

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("presence_snapshot", (items: PresenceSnapshotItem[]) => {
				set((state) => {
					const onlineUsers = new Set<string>();
					const userActivities = new Map(state.userActivities);
					let nextUsers = [...state.users];

					items.forEach((item) => {
						if (item.isOnline) {
							onlineUsers.add(item.userId);
						}
						userActivities.set(item.userId, item.activity || "Idle");
						nextUsers = applyUserPatch(nextUsers, item.userId, {
							isOnline: item.isOnline,
							lastSeenAt: item.lastSeenAt,
							currentActivity: item.activity || "Idle",
							currentSong: item.song || null,
						});
					});

					return {
						onlineUsers,
						userActivities,
						users: nextUsers,
						selectedUser: state.selectedUser
							? nextUsers.find((user) => user.clerkId === state.selectedUser?.clerkId) || state.selectedUser
							: null,
					};
				});
			});

			socket.on("activities", (activities: [string, string][]) => {
				set((state) => {
					const nextActivities = new Map(activities);
					const nextUsers = state.users.map((user) => ({
						...user,
						currentActivity: nextActivities.get(user.clerkId) || user.currentActivity || "Idle",
					}));

					return { userActivities: nextActivities, users: nextUsers };
				});
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
					users: applyUserPatch(state.users, userId, {
						isOnline: true,
						lastSeenAt: null,
					}),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					const disconnectedAt = new Date().toISOString();
					const nextUsers = applyUserPatch(state.users, userId, {
						isOnline: false,
						lastSeenAt: disconnectedAt,
						currentActivity: "Idle",
						currentSong: null,
					});

					return {
						onlineUsers: newOnlineUsers,
						users: nextUsers,
						selectedUser: state.selectedUser
							? nextUsers.find((user) => user.clerkId === state.selectedUser?.clerkId) || state.selectedUser
							: null,
					};
				});
			});

			socket.on("receive_message", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("message_sent", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("activity_updated", ({ userId, activity, song }: { userId: string; activity: string; song?: UserCurrentSong | null }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					const nextUsers = applyUserPatch(state.users, userId, {
						currentActivity: activity,
						currentSong: song || null,
						isOnline: true,
						lastSeenAt: null,
					});

					return {
						userActivities: newActivities,
						users: nextUsers,
						selectedUser: state.selectedUser
							? nextUsers.find((user) => user.clerkId === state.selectedUser?.clerkId) || state.selectedUser
							: null,
					};
				});
			});

			socket.on("artist_new_song", ({ song, artistName }) => {
				if (song?.title) {
					toast(`${artistName || "An artist"} uploaded: ${song.title}`);
				}
			});

			socket.on("message_error", (errorMessage: string) => {
				toast.error(errorMessage || "Failed to send message");
			});

			socket.connect();
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			socket.removeAllListeners();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket || !socket.connected) {
			toast.error("Chat is not connected yet");
			return;
		}

		socket.emit(
			"send_message",
			{ receiverId, senderId, content },
			(response: { ok?: boolean; error?: string }) => {
				if (!response?.ok && response?.error) {
					toast.error(response.error);
				}
			}
		);
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
