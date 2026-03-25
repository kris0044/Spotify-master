import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";
import { axiosInstance } from "@/lib/axios";
import { ensureResolvableSong } from "@/lib/ytMusic";
import toast from "react-hot-toast";

export const getPlaybackType = (song: Song | null) => {
	if (!song) return "local";
	if (song.source === "youtube_music" || song.externalVideoId) return "youtube";

	const playbackUrl = song.playbackUrl || song.audioUrl || "";
	return playbackUrl.includes("youtube.com") || playbackUrl.includes("youtu.be") ? "youtube" : "local";
};

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	upNextQueue: Song[];
	currentIndex: number;
	isQueueOpen: boolean;
	playbackPosition: number;
	playbackDuration: number;
	pendingSeekTime: number | null;

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	setPlaybackProgress: (position: number, duration?: number) => void;
	resetPlaybackProgress: (duration?: number) => void;
	requestSeek: (position: number) => void;
	clearPendingSeek: () => void;
	togglePlay: () => void;
	playNext: () => Promise<void>;
	playPrevious: () => void;
	fetchUpNextQueue: () => Promise<void>;
	addToUpNextQueue: (song: Song) => Promise<void>;
	removeFromUpNextQueue: (songId: string) => Promise<void>;
	clearUpNextQueue: () => Promise<void>;
	toggleQueuePanel: () => void;
	resetQueueState: () => void;
}

const updateActivity = (song: Song | null, isPlaying: boolean) => {
	const socket = useChatStore.getState().socket;
	if (socket.auth) {
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: isPlaying && song ? `Playing ${song.title} by ${song.artist}` : "Idle",
			song: isPlaying && song
				? {
					title: song.title,
					artist: song.artist,
					imageUrl: song.imageUrl,
				}
				: null,
		});
	}
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	upNextQueue: [],
	currentIndex: -1,
	isQueueOpen: false,
	playbackPosition: 0,
	playbackDuration: 0,
	pendingSeekTime: null,

	initializeQueue: (songs) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0] || null,
			currentIndex: get().currentIndex === -1 && songs.length > 0 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs, startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];
		updateActivity(song, true);

		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
			playbackPosition: 0,
			playbackDuration: song.duration || 0,
		});
	},

	setCurrentSong: (song) => {
		if (!song) return;

		updateActivity(song, true);
		const songIndex = get().queue.findIndex((queuedSong) => queuedSong._id === song._id);

		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
			playbackPosition: 0,
			playbackDuration: song.duration || 0,
		});
	},

	setPlaybackProgress: (position, duration) => {
		set((state) => ({
			playbackPosition: Number.isFinite(position) ? position : state.playbackPosition,
			playbackDuration: Number.isFinite(duration) ? (duration as number) : state.playbackDuration,
		}));
	},

	resetPlaybackProgress: (duration = 0) => {
		set({ playbackPosition: 0, playbackDuration: duration });
	},

	requestSeek: (position) => {
		set({ pendingSeekTime: position, playbackPosition: position });
	},

	clearPendingSeek: () => {
		set({ pendingSeekTime: null });
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;
		updateActivity(get().currentSong, willStartPlaying);
		set({ isPlaying: willStartPlaying });
	},

	playNext: async () => {
		try {
			if (get().upNextQueue.length > 0) {
				const response = await axiosInstance.post("/users/me/queue/consume");
				const nextSong: Song | null = response.data.song;
				const remainingQueue: Song[] = response.data.songs || [];

				if (nextSong) {
					updateActivity(nextSong, true);
					set({
						upNextQueue: remainingQueue,
						currentSong: nextSong,
						isPlaying: true,
						playbackPosition: 0,
						playbackDuration: nextSong.duration || 0,
					});
					return;
				}
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to load next queued song");
		}

		const { currentIndex, queue } = get();
		const nextIndex = currentIndex + 1;

		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];
			updateActivity(nextSong, true);
			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
				playbackPosition: 0,
				playbackDuration: nextSong.duration || 0,
			});
			return;
		}

		updateActivity(null, false);
		set({ isPlaying: false, playbackPosition: 0, playbackDuration: 0 });
	},

	playPrevious: () => {
		const { currentIndex, queue } = get();
		const prevIndex = currentIndex - 1;

		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];
			updateActivity(prevSong, true);
			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
				playbackPosition: 0,
				playbackDuration: prevSong.duration || 0,
			});
			return;
		}

		updateActivity(null, false);
		set({ isPlaying: false, playbackPosition: 0, playbackDuration: 0 });
	},

	fetchUpNextQueue: async () => {
		try {
			const response = await axiosInstance.get("/users/me/queue");
			set({ upNextQueue: response.data.songs || [] });
		} catch (error: any) {
			if (error.response?.status !== 401) {
				toast.error(error.response?.data?.message || "Failed to fetch queued songs");
			}
		}
	},

	addToUpNextQueue: async (song) => {
		try {
			const actionableSong = await ensureResolvableSong(song);
			const response = await axiosInstance.post("/users/me/queue", { songId: actionableSong._id });
			set({ upNextQueue: response.data.songs || [] });
			toast.success(`${actionableSong.title} added to Up Next`);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to queue song");
		}
	},

	removeFromUpNextQueue: async (songId) => {
		try {
			const response = await axiosInstance.delete(`/users/me/queue/${songId}`);
			set({ upNextQueue: response.data.songs || [] });
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to remove queued song");
		}
	},

	clearUpNextQueue: async () => {
		try {
			await axiosInstance.delete("/users/me/queue");
			set({ upNextQueue: [] });
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to clear queued songs");
		}
	},

	toggleQueuePanel: () => {
		set((state) => ({ isQueueOpen: !state.isQueueOpen }));
	},

	resetQueueState: () => {
		set({ upNextQueue: [], isQueueOpen: false });
	},
}));
