import { axiosInstance } from "@/lib/axios";
import type {
	PublicMusicAlbumSpotlight,
	PublicMusicArtistSpotlight,
	PublicMusicChartResponse,
	PublicMusicHomeSections,
	PublicMusicSong,
	Song,
} from "@/types";

const PUBLIC_HOME_SECTION_LIMIT = 8;
const PUBLIC_HOME_SPOTLIGHT_LIMIT = 4;
const PUBLIC_WATCH_URL = "https://www.youtube.com/watch?v=";
const PUBLIC_SONG_DATE = new Date(0).toISOString();
const PUBLIC_TEMP_ID_PREFIXES = ["publicmusic-", "featured-public-", "recommended-public-", "madeforyou-public-", "trending-public-", "search-public-"];

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

export const mapPublicMusicSongToSong = (song: PublicMusicSong, section = "publicmusic"): Song => ({
	_id: song.internalSongId || `${section}-${song.videoId}`,
	title: song.title,
	artist: song.artist,
	genre: "Public Music",
	albumId: song.album || null,
	imageUrl: song.thumbnailUrl,
	audioUrl: `${PUBLIC_WATCH_URL}${song.videoId}`,
	duration: song.duration ?? 0,
	createdAt: PUBLIC_SONG_DATE,
	updatedAt: PUBLIC_SONG_DATE,
	source: "youtube_music",
	externalVideoId: song.videoId,
	playbackUrl: `${PUBLIC_WATCH_URL}${song.videoId}`,
});

export const isTemporaryPublicSongId = (songId: string) => PUBLIC_TEMP_ID_PREFIXES.some((prefix) => songId.startsWith(prefix));

export const mergeUniqueSongs = (songs: Song[]) => {
	const songMap = new Map<string, Song>();

	for (const song of songs) {
		const key = song.externalVideoId || song._id;
		if (!key || songMap.has(key)) continue;
		songMap.set(key, song);
	}

	return Array.from(songMap.values());
};

export const searchUnifiedSongs = async (query: string, genre = "", limit = 12): Promise<Song[]> => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];

	const [localResponse, publicSongs] = await Promise.allSettled([
		axiosInstance.get("/songs", {
			params: {
				search: trimmedQuery,
				genre: genre.trim() || undefined,
				limit,
				offset: 0,
			},
		}),
		searchPublicMusicSongs(trimmedQuery),
	]);

	const localSongs: Song[] = localResponse.status === "fulfilled" ? localResponse.value.data ?? [] : [];
	const publicMappedSongs =
		publicSongs.status === "fulfilled" ? publicSongs.value.map((song) => mapPublicMusicSongToSong(song, "search-public")) : [];

	return mergeUniqueSongs([...localSongs, ...publicMappedSongs]).slice(0, limit);
};

const toSectionSongs = (songs: PublicMusicSong[], section: string, limit = PUBLIC_HOME_SECTION_LIMIT) =>
	mergeUniqueSongs(songs.map((song) => mapPublicMusicSongToSong(song, section))).slice(0, limit);

const isMeaningfulAlbum = (albumId: string | null) => {
	const normalizedAlbum = albumId?.trim().toLowerCase();
	return Boolean(normalizedAlbum && normalizedAlbum !== "single" && normalizedAlbum !== "unknown");
};

const buildArtistSpotlights = (songs: Song[]): PublicMusicArtistSpotlight[] => {
	const artistMap = new Map<
		string,
		{
			name: string;
			imageUrl: string;
			songs: Song[];
			albums: Set<string>;
		}
	>();

	for (const song of songs) {
		const key = song.artist.trim().toLowerCase();
		if (!key) continue;

		const currentArtist =
			artistMap.get(key) ||
			{
				name: song.artist,
				imageUrl: song.imageUrl,
				songs: [],
				albums: new Set<string>(),
			};

		if (!currentArtist.songs.some((artistSong) => (artistSong.externalVideoId || artistSong._id) === (song.externalVideoId || song._id))) {
			currentArtist.songs.push(song);
		}
		if (isMeaningfulAlbum(song.albumId)) {
			currentArtist.albums.add(song.albumId as string);
		}
		if (!currentArtist.imageUrl && song.imageUrl) {
			currentArtist.imageUrl = song.imageUrl;
		}

		artistMap.set(key, currentArtist);
	}

	return Array.from(artistMap.values())
		.sort((left, right) => right.songs.length - left.songs.length)
		.slice(0, PUBLIC_HOME_SPOTLIGHT_LIMIT)
		.map((artist) => ({
			name: artist.name,
			imageUrl: artist.imageUrl,
			songs: artist.songs.slice(0, 3),
			songCount: artist.songs.length,
			albumCount: artist.albums.size,
		}));
};

const buildAlbumSpotlights = (songs: Song[]): PublicMusicAlbumSpotlight[] => {
	const albumMap = new Map<string, PublicMusicAlbumSpotlight>();

	for (const song of songs) {
		if (!isMeaningfulAlbum(song.albumId)) continue;

		const key = `${song.artist.trim().toLowerCase()}::${song.albumId?.trim().toLowerCase()}`;
		const currentAlbum =
			albumMap.get(key) ||
			{
				title: song.albumId as string,
				artist: song.artist,
				imageUrl: song.imageUrl,
				songs: [],
			};

		if (!currentAlbum.songs.some((albumSong) => (albumSong.externalVideoId || albumSong._id) === (song.externalVideoId || song._id))) {
			currentAlbum.songs.push(song);
		}
		if (!currentAlbum.imageUrl && song.imageUrl) {
			currentAlbum.imageUrl = song.imageUrl;
		}

		albumMap.set(key, currentAlbum);
	}

	return Array.from(albumMap.values())
		.sort((left, right) => right.songs.length - left.songs.length)
		.slice(0, PUBLIC_HOME_SPOTLIGHT_LIMIT);
};

export const fetchPublicMusicHomeSections = async (): Promise<PublicMusicHomeSections> => {
	const [globalChart, regionalChart, featuredSearch, recommendedSearch, madeForYouSearch] = await Promise.allSettled([
		fetchPublicMusicCharts("global"),
		fetchPublicMusicCharts("region", "United States"),
		searchPublicMusicSongs("new music releases"),
		searchPublicMusicSongs("recommended songs"),
		searchPublicMusicSongs("made for you mix"),
	]);

	const globalSongs = globalChart.status === "fulfilled" ? globalChart.value.songs : [];
	const regionalSongs = regionalChart.status === "fulfilled" ? regionalChart.value.songs : [];
	const featuredSongs = featuredSearch.status === "fulfilled" ? featuredSearch.value : [];
	const recommendedSongs = recommendedSearch.status === "fulfilled" ? recommendedSearch.value : [];
	const madeForYouSongs = madeForYouSearch.status === "fulfilled" ? madeForYouSearch.value : [];

	const featured = toSectionSongs([...featuredSongs, ...globalSongs.slice(0, 4)], "featured-public");
	const recommended = toSectionSongs([...recommendedSongs, ...regionalSongs.slice(0, 4)], "recommended-public");
	const madeForYou = toSectionSongs([...madeForYouSongs, ...featuredSongs.slice(0, 4)], "madeforyou-public");
	const trending = toSectionSongs([...globalSongs, ...regionalSongs], "trending-public");
	const library = mergeUniqueSongs([...featured, ...recommended, ...madeForYou, ...trending]);

	return {
		featuredSongs: featured,
		recommendedSongs: recommended,
		madeForYouSongs: madeForYou,
		trendingSongs: trending,
		artists: buildArtistSpotlights(library),
		albums: buildAlbumSpotlights(library),
	};
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

export const ensureResolvableSong = async (song: Song): Promise<Song> => {
	if (song.source !== "youtube_music" && !song.externalVideoId) {
		return song;
	}

	if (song._id && !isTemporaryPublicSongId(song._id)) {
		return song;
	}

	if (!song.externalVideoId) {
		return song;
	}

	return resolvePublicMusicSong({
		videoId: song.externalVideoId,
		title: song.title,
		artist: song.artist,
		album: song.albumId,
		duration: song.duration,
		thumbnailUrl: song.imageUrl,
		internalSongId: null,
	});
};
