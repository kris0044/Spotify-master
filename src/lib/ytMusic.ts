import { axiosInstance } from "@/lib/axios";
import type { PublicMusicChartResponse, PublicMusicSong, Song } from "@/types";

export const searchPublicMusicSongs = async (query: string): Promise<PublicMusicSong[]> => {
	const response = await axiosInstance.get("/publicmusic/search", {
		params: { q: query },
	});

	return response.data.songs ?? [];
};

export const fetchPublicMusicCharts = async (scope: "global" | "region", region?: string): Promise<PublicMusicChartResponse> => {
	const response = await axiosInstance.get("/publicmusic/charts", {
		params: {
			scope,
			region,
		},
	});

	return response.data;
};

export const resolvePublicMusicSong = async (song: PublicMusicSong): Promise<Song> => {
	const response = await axiosInstance.post("/publicmusic/resolve", {
		videoId: song.videoId,
		title: song.title,
		artist: song.artist,
		album: song.album,
		duration: song.duration,
		thumbnailUrl: song.thumbnailUrl,
	});

	return response.data;
};
