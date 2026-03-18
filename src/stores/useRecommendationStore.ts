import { axiosInstance } from "@/lib/axios";
import { RecommendationResponse, Song } from "@/types";
import { create } from "zustand";

interface RecommendationStore {
	recommendations: Song[];
	topArtists: string[];
	topGenres: string[];
	isLoading: boolean;
	error: string | null;
	fetchRecommendations: () => Promise<void>;
	reset: () => void;
}

export const useRecommendationStore = create<RecommendationStore>((set) => ({
	recommendations: [],
	topArtists: [],
	topGenres: [],
	isLoading: false,
	error: null,

	fetchRecommendations: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get<RecommendationResponse>("/recommendations");
			set({
				recommendations: response.data.recommendations || [],
				topArtists: response.data.topArtists || [],
				topGenres: response.data.topGenres || [],
			});
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to fetch recommendations";
			set({ error: message, recommendations: [], topArtists: [], topGenres: [] });
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ recommendations: [], topArtists: [], topGenres: [], isLoading: false, error: null });
	},
}));
