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
			const res = await axiosInstance.get("/admin/check");
			set({ isAdmin: res.data.admin  });
		} catch {
			// If 401 or any error, user is not admin
			set({
				isAdmin: false,
				error: null, // Don't show error for admin check failures
			});
		} finally {
			set({ isLoading: false });
		}
	},

	checkUserRole: async () => {
		set({ isLoading: true, error: null });
		try {
			// Fetch current user info - we'll need to add this endpoint or use existing user data
			// For now, we'll check admin status and infer artist from that
			const res = await axiosInstance.get("/admin/check").catch(() => ({ data: { admin: false } }));
			set({ isAdmin: res.data.admin });
			// Artist check will be done via try/catch on artist endpoints
		} catch {
			set({ isAdmin: false, error: null });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ isAdmin: false, isArtist: false, user: null, isLoading: false, error: null });
	},
}));
