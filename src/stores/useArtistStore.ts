import { axiosInstance } from "@/lib/axios";
import { Song, Album } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface ArtistStore {
	mySongs: Song[];
	myAlbums: Album[];
	isLoading: boolean;
	error: string | null;

	fetchMyUploads: () => Promise<void>;
	uploadSong: (formData: FormData) => Promise<void>;
	uploadAlbum: (formData: FormData) => Promise<void>;
	reset: () => void;
}

export const useArtistStore = create<ArtistStore>((set, get) => ({
	mySongs: [],
	myAlbums: [],
	isLoading: false,
	error: null,

	fetchMyUploads: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/artist/uploads");
			set({ mySongs: response.data.songs, myAlbums: response.data.albums });
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

	reset: () => {
		set({ mySongs: [], myAlbums: [], isLoading: false, error: null });
	},
}));

