import { axiosInstance } from "@/lib/axios";
import { Song } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface FavoriteStore {
	favorites: Song[];
	favoriteIds: Set<string>;
	isLoading: boolean;
	error: string | null;

	fetchFavorites: () => Promise<void>;
	addToFavorites: (songId: string) => Promise<void>;
	removeFromFavorites: (songId: string) => Promise<void>;
	checkIsFavorite: (songId: string) => Promise<boolean>;
	isFavorite: (songId: string) => boolean;
	reset: () => void;
}

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
	favorites: [],
	favoriteIds: new Set(),
	isLoading: false,
	error: null,

	fetchFavorites: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/favorites");
			const favorites = response.data;
			const favoriteIds = new Set(favorites.map((song: Song) => song._id));
			set({ favorites, favoriteIds: new Set(favoriteIds) as Set<string> });
		} catch (error: unknown) {
			console.error("Failed to fetch favorites", error);
			set({ error: "Failed to fetch favorites" });
			toast.error("Failed to fetch favorites");
		} finally {
			set({ isLoading: false });
		}
	},

	addToFavorites: async (songId: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post("/favorites", { songId });
			set((state) => {
				const newFavoriteIds = new Set(state.favoriteIds);
				newFavoriteIds.add(songId);
				return { favoriteIds: newFavoriteIds };
			});
			toast.success("Added to favorites");
			// Refresh favorites list
			await get().fetchFavorites();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to add to favorites";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	removeFromFavorites: async (songId: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/favorites/${songId}`);
			set((state) => {
				const newFavoriteIds = new Set(state.favoriteIds);
				newFavoriteIds.delete(songId);
				return { favoriteIds: newFavoriteIds };
			});
			toast.success("Removed from favorites");
			// Refresh favorites list
			await get().fetchFavorites();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to remove from favorites";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	checkIsFavorite: async (songId: string) => {
		try {
			const response = await axiosInstance.get(`/favorites/${songId}/check`);
			const isFavorite = response.data.isFavorite;
			set((state) => {
				const newFavoriteIds = new Set(state.favoriteIds);
				if (isFavorite) {
					newFavoriteIds.add(songId);
				} else {
					newFavoriteIds.delete(songId);
				}
				return { favoriteIds: newFavoriteIds };
			});
			return isFavorite;
		} catch (error: any) {
			console.error("Failed to check if song is favorite", error);
			return false;
		}
	},

	isFavorite: (songId: string) => {
		return get().favoriteIds.has(songId);
	},

	reset: () => {
		set({ favorites: [], favoriteIds: new Set(), isLoading: false, error: null });
	},
}));

