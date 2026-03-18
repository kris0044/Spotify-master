import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";
import { create } from "zustand";

interface AuthStore {
	isAdmin: boolean;
	isArtist: boolean;
	user: User | null;
	isLoading: boolean;
	error: string | null;
	role : "admin" | "artist" | "user" | null;
	checkAdminStatus: () => Promise<void>;
	checkUserRole: () => Promise<void>;
	reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
	isAdmin: false,
	isArtist: false,
	user: null,
	isLoading: false,
	error: null,
	role: null,

	checkAdminStatus: async () => {
		set({ isLoading: true, error: null });

		try {
			const [adminRes, userRes] = await Promise.all([
				axiosInstance.get("/admin/check").catch(() => ({ data: { admin: false } })),
				axiosInstance.get<User>("/users/me").catch(() => ({ data: null })),
			]);

			const currentUser = userRes.data;
			const role = currentUser?.role || null;
			const isAdmin = Boolean(adminRes.data.admin) || role === "admin";
			const isArtist = role === "artist";

			set({
				isAdmin,
				isArtist,
				role,
				user: currentUser || null,
			});
		} catch {
			set({
				isAdmin: false,
				isArtist: false,
				role: null,
				user: null,
				error: null,
			});
		} finally {
			set({ isLoading: false });
		}
	},

	checkUserRole: async () => {
		set({ isLoading: true, error: null });
		try {
			const [adminRes, userRes] = await Promise.all([
				axiosInstance.get("/admin/check").catch(() => ({ data: { admin: false } })),
				axiosInstance.get<User>("/users/me"),
			]);
			const role = userRes.data?.role || "user";
			set({
				user: userRes.data,
				role,
				isArtist: role === "artist",
				isAdmin: Boolean(adminRes.data.admin) || role === "admin",
			});
		} catch {
			set({ isAdmin: false, isArtist: false, role: null, user: null, error: null });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isArtist: false, user: null, isLoading: false, error: null, role: null });
	},
}));
