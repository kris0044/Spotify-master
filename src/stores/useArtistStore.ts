import { axiosInstance } from "@/lib/axios";
import { Album, ArtistDashboardStats, Song } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface ArtistStore {
	mySongs: Song[];
	myAlbums: Album[];
	dashboard: ArtistDashboardStats | null;
	isLoading: boolean;
	error: string | null;

	fetchDashboard: () => Promise<void>;
	fetchMySongs: () => Promise<void>;
	fetchMyUploads: () => Promise<void>;
	uploadSong: (formData: FormData) => Promise<void>;
	uploadAlbum: (formData: FormData) => Promise<void>;
	deleteMySong: (songId: string) => Promise<void>;
	reset: () => void;
}

const defaultDashboard: ArtistDashboardStats = {
	totalPlays: 0,
	uniqueListeners: 0,
	followers: 0,
	totalSongs: 0,
	topSongs: [],
};

export const useArtistStore = create<ArtistStore>((set, get) => ({
	mySongs: [],
	myAlbums: [],
	dashboard: null,
	isLoading: false,
	error: null,

	fetchDashboard: async () => {
		try {
			const response = await axiosInstance.get<ArtistDashboardStats>("/artist/dashboard");
			set({ dashboard: { ...defaultDashboard, ...response.data } });
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to fetch artist dashboard";
			set({ error: errorMsg, dashboard: defaultDashboard });
		}
	},

	fetchMySongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get<Song[]>("/artist/songs");
			set({ mySongs: response.data });
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to fetch your songs";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMyUploads: async () => {
		set({ isLoading: true, error: null });
		try {
			const [songsRes, uploadsRes, dashboardRes] = await Promise.all([
				axiosInstance.get<Song[]>("/artist/songs"),
				axiosInstance.get<{ songs: Song[]; albums: Album[] }>("/artist/uploads"),
				axiosInstance.get<ArtistDashboardStats>("/artist/dashboard"),
			]);

			set({
				mySongs: songsRes.data,
				myAlbums: uploadsRes.data.albums || [],
				dashboard: { ...defaultDashboard, ...dashboardRes.data },
			});
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to fetch uploads";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	uploadSong: async (formData: FormData) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post("/artist/songs", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			toast.success("Song uploaded successfully! Waiting for admin approval.");
			await get().fetchMyUploads();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to upload song";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	uploadAlbum: async (formData: FormData) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post("/artist/albums", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			toast.success("Album uploaded successfully! Waiting for admin approval.");
			await get().fetchMyUploads();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to upload album";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	deleteMySong: async (songId: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/artist/songs/${songId}`);
			toast.success("Song deleted successfully");
			await get().fetchMyUploads();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to delete song";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ mySongs: [], myAlbums: [], dashboard: null, isLoading: false, error: null });
	},
}));
