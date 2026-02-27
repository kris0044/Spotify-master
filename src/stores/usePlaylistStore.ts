import { axiosInstance } from "@/lib/axios";
import { Playlist } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface PlaylistStore {
	playlists: Playlist[];
	currentPlaylist: Playlist | null;
	isLoading: boolean;
	error: string | null;

	fetchPlaylists: () => Promise<void>;
	fetchPlaylistById: (id: string) => Promise<void>;
	createPlaylist: (name: string, description?: string) => Promise<void>;
	updatePlaylist: (id: string, name?: string, description?: string) => Promise<void>;
	deletePlaylist: (id: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	reset: () => void;
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
	playlists: [],
	currentPlaylist: null,
	isLoading: false,
	error: null,

	fetchPlaylists: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/playlists");
			set({ playlists: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch playlists" });
			toast.error("Failed to fetch playlists");
		} finally {
			set({ isLoading: false });
		}
	},

	fetchPlaylistById: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/playlists/${id}`);
			set({ currentPlaylist: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch playlist" });
			toast.error("Failed to fetch playlist");
		} finally {
			set({ isLoading: false });
		}
	},

	createPlaylist: async (name: string, description?: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post("/playlists", { name, description });
			set((state) => ({
				playlists: [response.data, ...state.playlists],
			}));
			toast.success("Playlist created successfully");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to create playlist";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	updatePlaylist: async (id: string, name?: string, description?: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/playlists/${id}`, { name, description });
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === id ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === id ? response.data : state.currentPlaylist,
			}));
			toast.success("Playlist updated successfully");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to update playlist";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	deletePlaylist: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/playlists/${id}`);
			set((state) => ({
				playlists: state.playlists.filter((p) => p._id !== id),
				currentPlaylist: state.currentPlaylist?._id === id ? null : state.currentPlaylist,
			}));
			toast.success("Playlist deleted successfully");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to delete playlist";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	addSongToPlaylist: async (playlistId: string, songId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.post(`/playlists/${playlistId}/songs`, { songId });
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
			}));
			toast.success("Song added to playlist");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to add song to playlist";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	removeSongFromPlaylist: async (playlistId: string, songId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);
			set((state) => ({
				playlists: state.playlists.map((p) => (p._id === playlistId ? response.data : p)),
				currentPlaylist: state.currentPlaylist?._id === playlistId ? response.data : state.currentPlaylist,
			}));
			toast.success("Song removed from playlist");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to remove song from playlist";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ playlists: [], currentPlaylist: null, isLoading: false, error: null });
	},
}));

