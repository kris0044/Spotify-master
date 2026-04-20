import type { Album, Song } from "@/types";

export interface PublicGenreOption {
	id: string;
	label: string;
	query: string;
	accent: string;
}

interface ITunesSongResult {
	collectionId?: number;
	trackId: number;
	trackName: string;
	artistName: string;
	collectionName?: string;
	primaryGenreName?: string;
	artworkUrl100?: string;
	previewUrl?: string;
	trackTimeMillis?: number;
}

interface ITunesSearchResponse<T> {
	results?: T[];
}

interface ITunesAlbumResult {
	collectionId: number;
	collectionName: string;
	artistName: string;
	artworkUrl100?: string;
	releaseDate?: string;
	trackCount?: number;
	primaryGenreName?: string;
}

const isITunesAlbumResult = (result: ITunesAlbumResult | ITunesSongResult): result is ITunesAlbumResult =>
	typeof result.collectionId === "number" && "collectionName" in result && !("trackId" in result);

export const PUBLIC_GENRE_OPTIONS: PublicGenreOption[] = [
	{ id: "pop", label: "Pop", query: "pop", accent: "from-rose-500/20 via-orange-500/10 to-transparent" },
	{ id: "rock", label: "Rock", query: "rock", accent: "from-slate-200/20 via-slate-500/10 to-transparent" },
	{ id: "hiphop", label: "Hip Hop", query: "hip hop", accent: "from-amber-500/20 via-yellow-500/10 to-transparent" },
	{ id: "indie", label: "Indie", query: "indie", accent: "from-emerald-500/20 via-teal-500/10 to-transparent" },
	{ id: "electronic", label: "Electronic", query: "electronic", accent: "from-cyan-500/20 via-sky-500/10 to-transparent" },
	{ id: "jazz", label: "Jazz", query: "jazz", accent: "from-blue-500/20 via-indigo-500/10 to-transparent" },
	{ id: "classical", label: "Classical", query: "classical", accent: "from-stone-300/20 via-neutral-500/10 to-transparent" },
	{ id: "rnb", label: "R&B", query: "rnb", accent: "from-fuchsia-500/20 via-pink-500/10 to-transparent" },
	{ id: "country", label: "Country", query: "country", accent: "from-lime-500/20 via-emerald-500/10 to-transparent" },
	{ id: "latin", label: "Latin", query: "latin", accent: "from-red-500/20 via-orange-500/10 to-transparent" },
	{ id: "kpop", label: "K-Pop", query: "kpop", accent: "from-violet-500/20 via-fuchsia-500/10 to-transparent" },
	{ id: "lofi", label: "Lo-Fi", query: "lofi", accent: "from-zinc-300/20 via-zinc-500/10 to-transparent" },
] as const;

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const PUBLIC_SONG_DATE = new Date(0).toISOString();
const publicSongCache = new Map<string, Song[]>();
const publicAlbumCache = new Map<string, Album[]>();
const publicAlbumDetailCache = new Map<string, Album | null>();

const buildArtworkUrl = (url?: string) => (url ? url.replace(/\/\d+x\d+bb\./, "/600x600bb.") : "");

const buildSearchTerm = (genre: string, query = "") => [genre, query.trim()].filter(Boolean).join(" ").trim();

export const mapGenreSongToSong = (song: ITunesSongResult): Song => ({
	_id: `genre-public-${song.trackId}`,
	title: song.trackName,
	artist: song.artistName,
	genre: song.primaryGenreName || "Public Genre",
	albumId: song.collectionName || null,
	imageUrl: buildArtworkUrl(song.artworkUrl100),
	audioUrl: song.previewUrl || "",
	duration: song.trackTimeMillis ? Math.round(song.trackTimeMillis / 1000) : 30,
	createdAt: PUBLIC_SONG_DATE,
	updatedAt: PUBLIC_SONG_DATE,
	source: "public_preview",
	playbackUrl: song.previewUrl || "",
});

const toPublicAlbumId = (collectionId: number) => `public-album-${collectionId}`;

const extractCollectionId = (albumId: string) => {
	const match = albumId.match(/^public-album-(\d+)$/);
	return match ? Number(match[1]) : null;
};

const buildPublicAlbumFromResult = (album: ITunesAlbumResult): Album => ({
	_id: toPublicAlbumId(album.collectionId),
	title: album.collectionName,
	artist: album.artistName,
	genre: album.primaryGenreName || "Public Album",
	imageUrl: buildArtworkUrl(album.artworkUrl100),
	releaseYear: album.releaseDate ? new Date(album.releaseDate).getFullYear() : 0,
	songs: [],
	trackCount: album.trackCount || 0,
	createdAt: album.releaseDate || PUBLIC_SONG_DATE,
	source: "public_api",
});

const searchITunes = async <T>(params: Record<string, string | number | undefined>) => {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== "") {
			searchParams.set(key, String(value));
		}
	});

	const response = await fetch(`${ITUNES_SEARCH_URL}?${searchParams.toString()}`);
	if (!response.ok) {
		throw new Error("Public music service request failed");
	}

	const data = (await response.json()) as ITunesSearchResponse<T>;
	return data.results ?? [];
};

const lookupITunes = async <T>(params: Record<string, string | number | undefined>) => {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== "") {
			searchParams.set(key, String(value));
		}
	});

	const response = await fetch(`${ITUNES_LOOKUP_URL}?${searchParams.toString()}`);
	if (!response.ok) {
		throw new Error("Public album lookup failed");
	}

	const data = (await response.json()) as ITunesSearchResponse<T>;
	return data.results ?? [];
};

export const fetchGenreSongs = async (genre: string, query = "", limit = 18): Promise<Song[]> => {
	const term = buildSearchTerm(genre, query);
	if (!term) return [];
	const cacheKey = `${term.toLowerCase()}::${limit}`;
	const cachedSongs = publicSongCache.get(cacheKey);
	if (cachedSongs) {
		return cachedSongs;
	}

	const results = await searchITunes<ITunesSongResult>({
		term,
		media: "music",
		entity: "song",
		limit,
		country: "US",
	});

	const songs = results
		.filter((song) => song.previewUrl && song.trackName && song.artistName)
		.map(mapGenreSongToSong);

	publicSongCache.set(cacheKey, songs);
	return songs;
};

export const fetchPublicAlbums = async (genre = "", query = "", limit = 12): Promise<Album[]> => {
	const term = buildSearchTerm(genre, query) || "top albums";
	const cacheKey = `${term.toLowerCase()}::${limit}`;
	const cachedAlbums = publicAlbumCache.get(cacheKey);
	if (cachedAlbums) {
		return cachedAlbums;
	}

	const results = await searchITunes<ITunesAlbumResult>({
		term,
		media: "music",
		entity: "album",
		limit,
		country: "US",
	});

	const albums = results
		.filter((album) => (album.trackCount || 0) > 1)
		.map(buildPublicAlbumFromResult);

	publicAlbumCache.set(cacheKey, albums);
	return albums;
};

export const isPublicAlbumId = (albumId: string) => albumId.startsWith("public-album-");

export const fetchPublicAlbumById = async (albumId: string): Promise<Album | null> => {
	const cachedAlbum = publicAlbumDetailCache.get(albumId);
	if (cachedAlbum !== undefined) {
		return cachedAlbum;
	}

	const collectionId = extractCollectionId(albumId);
	if (!collectionId) return null;

	const results = await lookupITunes<ITunesAlbumResult | ITunesSongResult>({
		id: collectionId,
		entity: "song",
		country: "US",
	});

	const albumResult = results.find(isITunesAlbumResult);
	if (!albumResult) {
		publicAlbumDetailCache.set(albumId, null);
		return null;
	}

	const trackResults = results.filter((result): result is ITunesSongResult => "trackId" in result);
	const songs = trackResults.map((track) => ({
		...mapGenreSongToSong(track),
		_id: `public-track-${track.trackId}`,
		albumId: albumResult.collectionName || track.collectionName || null,
		genre: track.primaryGenreName || albumResult.primaryGenreName || "Public Album",
		createdAt: albumResult.releaseDate || PUBLIC_SONG_DATE,
		updatedAt: albumResult.releaseDate || PUBLIC_SONG_DATE,
		source: "public_preview",
	}));

	const album = {
		...buildPublicAlbumFromResult(albumResult),
		songs,
		trackCount: songs.length || albumResult.trackCount || 0,
	};

	publicAlbumDetailCache.set(albumId, album);
	return album;
};
