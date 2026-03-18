import { axiosInstance } from "@/lib/axios";
import { ListeningHistoryItem, ListeningHistoryStats } from "@/types";
import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

interface HistoryStore {
	recentlyPlayed: ListeningHistoryItem[];
	topPlayedSongs: ListeningHistoryItem[];
	stats: ListeningHistoryStats;
	isLoading: boolean;
	error: string | null;

	fetchRecentHistory: () => Promise<void>;
	fetchTopPlayedSongs: () => Promise<void>;
	fetchHistoryStats: () => Promise<void>;
	fetchListeningHistory: () => Promise<void>;
	reset: () => void;
}

const defaultStats: ListeningHistoryStats = {
	totalPlays: 0,
	uniqueSongs: 0,
	lastPlayedAt: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.message || fallback;
	}
	return fallback;
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
	recentlyPlayed: [],
	topPlayedSongs: [],
	stats: defaultStats,
	isLoading: false,
	error: null,

	fetchRecentHistory: async () => {
		try {
			const response = await axiosInstance.get<ListeningHistoryItem[]>("/history/recent");
			set({ recentlyPlayed: response.data });
		} catch (error: unknown) {
			const message = getErrorMessage(error, "Failed to fetch recently played songs");
			set({ error: message });
			toast.error(message);
		}
	},

	fetchTopPlayedSongs: async () => {
		try {
			const response = await axiosInstance.get<ListeningHistoryItem[]>("/history/top");
			set({ topPlayedSongs: response.data });
		} catch (error: unknown) {
			const message = getErrorMessage(error, "Failed to fetch top played songs");
			set({ error: message });
			toast.error(message);
		}
	},

	fetchHistoryStats: async () => {
		try {
			const response = await axiosInstance.get<ListeningHistoryStats>("/history/stats");
			set({ stats: response.data });
		} catch (error: unknown) {
			const message = getErrorMessage(error, "Failed to fetch history stats");
			set({ error: message });
			toast.error(message);
		}
	},

	fetchListeningHistory: async () => {
		set({ isLoading: true, error: null });
		try {
			await Promise.all([get().fetchRecentHistory(), get().fetchTopPlayedSongs(), get().fetchHistoryStats()]);
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () =>
		set({
			recentlyPlayed: [],
			topPlayedSongs: [],
			stats: defaultStats,
			isLoading: false,
			error: null,
		}),
}));
