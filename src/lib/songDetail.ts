import { Song } from "@/types";
import { isTemporaryPublicSongId } from "@/lib/ytMusic";

const PUBLIC_WATCH_URL = "https://www.youtube.com/watch?v=";
const PUBLIC_SONG_DATE = new Date(0).toISOString();

export const buildSongDetailHref = (song: Song) => {
	const searchParams = new URLSearchParams();
	const shouldPersistPublicMetadata = song.source === "youtube_music" || isTemporaryPublicSongId(song._id);

	if (shouldPersistPublicMetadata) {
		if (song.externalVideoId) searchParams.set("videoId", song.externalVideoId);
		if (song.title) searchParams.set("title", song.title);
		if (song.artist) searchParams.set("artist", song.artist);
		if (song.genre) searchParams.set("genre", song.genre);
		if (song.albumId) searchParams.set("albumId", song.albumId);
		if (song.imageUrl) searchParams.set("imageUrl", song.imageUrl);
		if (song.duration) searchParams.set("duration", String(song.duration));
		if (song.source) searchParams.set("source", song.source);
		if (song.playbackUrl) searchParams.set("playbackUrl", song.playbackUrl);
		if (song.audioUrl) searchParams.set("audioUrl", song.audioUrl);
	}

	const query = searchParams.toString();
	return `/songs/${encodeURIComponent(song._id)}${query ? `?${query}` : ""}`;
};

export const getSongFromDetailParams = (songId: string, searchParams: URLSearchParams): Song | null => {
	const videoId = searchParams.get("videoId");
	const title = searchParams.get("title");
	const artist = searchParams.get("artist");
	const imageUrl = searchParams.get("imageUrl");

	if (!videoId || !title || !artist || !imageUrl) {
		return null;
	}

	return {
		_id: songId,
		title,
		artist,
		genre: searchParams.get("genre") || "Public Music",
		albumId: searchParams.get("albumId") || null,
		imageUrl,
		audioUrl: searchParams.get("audioUrl") || `${PUBLIC_WATCH_URL}${videoId}`,
		duration: Number(searchParams.get("duration") || 0),
		createdAt: PUBLIC_SONG_DATE,
		updatedAt: PUBLIC_SONG_DATE,
		source: searchParams.get("source") || "youtube_music",
		externalVideoId: videoId,
		playbackUrl: searchParams.get("playbackUrl") || `${PUBLIC_WATCH_URL}${videoId}`,
	};
};
