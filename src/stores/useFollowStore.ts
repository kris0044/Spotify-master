import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface FollowingSong {
	followingModel: "Song" | "Artist" | "User";
	following: {
		_id: string;
	};
}

interface FollowStore {
	followingSongIds: Set<string>;
	isLoading: boolean;
	isHydrated: boolean;
	error: string | null;
	fetchFollowing: () => Promise<void>;
	isFollowingSong: (songId: string) => boolean;
	followSong: (songId: string) => Promise<void>;
	unfollowSong: (songId: string) => Promise<void>;
	reset: () => void;
}

export const useFollowStore = create<FollowStore>((set, get) => ({
	followingSongIds: new Set(),
	isLoading: false,
	isHydrated: false,
	error: null,

	fetchFollowing: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get<FollowingSong[]>("/following");
			const songIds = new Set(
				(response.data || [])
					.filter((item) => item.followingModel === "Song")
					.map((item) => item.following?._id)
					.filter(Boolean)
			);
			set({ followingSongIds: songIds, isHydrated: true });
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to fetch following";
			set({ error: message, isHydrated: true });
		} finally {
			set({ isLoading: false });
		}
	},

	isFollowingSong: (songId) => get().followingSongIds.has(songId),

	followSong: async (songId: string) => {
		try {
			await axiosInstance.post("/follow", { followingId: songId, followingModel: "Song" });
			set((state) => {
				const updated = new Set(state.followingSongIds);
				updated.add(songId);
				return { followingSongIds: updated };
			});
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to follow song";
			set({ error: message });
			throw error;
		}
	},

	unfollowSong: async (songId: string) => {
		try {
			await axiosInstance.delete("/unfollow", { data: { followingId: songId, followingModel: "Song" } });
			set((state) => {
				const updated = new Set(state.followingSongIds);
				updated.delete(songId);
				return { followingSongIds: updated };
			});
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to unfollow song";
			set({ error: message });
			throw error;
		}
	},

	reset: () => {
		set({ followingSongIds: new Set(), isLoading: false, isHydrated: false, error: null });
	},
}));
