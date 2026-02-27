import { axiosInstance } from "@/lib/axios";
import { Song, Album, User } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";
import { useMusicStore } from "@/stores/useMusicStore";

interface AdminStore {
	pendingSongs: Song[];
	pendingAlbums: Album[];
	users: User[];
	isLoading: boolean;
	error: string | null;

	fetchPendingSongs: () => Promise<void>;
	fetchPendingAlbums: () => Promise<void>;
	fetchUsers: () => Promise<void>;
	approveSong: (id: string) => Promise<void>;
	rejectSong: (id: string) => Promise<void>;
	approveAlbum: (id: string) => Promise<void>;
	rejectAlbum: (id: string) => Promise<void>;
	updateUser: (id: string, role: "user" | "admin" | "artist") => Promise<void>;
	deleteUser: (id: string) => Promise<void>;
	reset: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
	pendingSongs: [],
	pendingAlbums: [],
	users: [],
	isLoading: false,
	error: null,

	fetchPendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/songs/pending");
			set({ pendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch pending songs" });
			toast.error("Failed to fetch pending songs");
		} finally {
			set({ isLoading: false });
		}
	},

	fetchPendingAlbums: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/albums/pending");
			set({ pendingAlbums: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch pending albums" });
			toast.error("Failed to fetch pending albums");
		} finally {
			set({ isLoading: false });
		}
	},

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/admin/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Failed to fetch users" });
			toast.error("Failed to fetch users");
		} finally {
			set({ isLoading: false });
		}
	},

	approveSong: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post(`/admin/songs/${id}/approve`);
			set((state) => ({
				pendingSongs: state.pendingSongs.filter((song) => song._id !== id),
			}));
			toast.success("Song approved");
			// Refresh songs list
			const musicStore = useMusicStore.getState();
			musicStore.fetchSongs();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to approve song";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	rejectSong: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post(`/admin/songs/${id}/reject`);
			set((state) => ({
				pendingSongs: state.pendingSongs.filter((song) => song._id !== id),
			}));
			toast.success("Song rejected");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to reject song";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	approveAlbum: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post(`/admin/albums/${id}/approve`);
			set((state) => ({
				pendingAlbums: state.pendingAlbums.filter((album) => album._id !== id),
			}));
			toast.success("Album approved");
			// Refresh albums list
			const musicStore = useMusicStore.getState();
			musicStore.fetchAlbums();
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to approve album";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	rejectAlbum: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.post(`/admin/albums/${id}/reject`);
			set((state) => ({
				pendingAlbums: state.pendingAlbums.filter((album) => album._id !== id),
			}));
			toast.success("Album rejected");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to reject album";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	updateUser: async (id: string, role: "user" | "admin" | "artist") => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.put(`/admin/users/${id}`, { role });
			set((state) => ({
				users: state.users.map((user) => (user._id === id ? response.data : user)),
			}));
			toast.success("User updated successfully");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to update user";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	deleteUser: async (id: string) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/users/${id}`);
			set((state) => ({
				users: state.users.filter((user) => user._id !== id),
			}));
			toast.success("User deleted successfully");
		} catch (error: any) {
			const errorMsg = error.response?.data?.message || "Failed to delete user";
			set({ error: errorMsg });
			toast.error(errorMsg);
		} finally {
			set({ isLoading: false });
		}
	},

	reset: () => {
		set({ pendingSongs: [], pendingAlbums: [], users: [], isLoading: false, error: null });
	},
}));

