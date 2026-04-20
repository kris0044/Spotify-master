import { axiosInstance } from "@/lib/axios";
import type {
	PublicArtistCollection,
	PublicArtistDirectoryResponse,
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
const PUBLIC_CACHE_TTL_MS = 5 * 60 * 1000;
const publicSearchCache = new Map<string, { value: PublicMusicSong[]; expiresAt: number }>();
const publicChartCache = new Map<string, { value: PublicMusicChartResponse; expiresAt: number }>();
const unifiedSearchCache = new Map<string, { value: Song[]; expiresAt: number }>();
const inFlightPublicSearches = new Map<string, Promise<PublicMusicSong[]>>();
const inFlightPublicCharts = new Map<string, Promise<PublicMusicChartResponse>>();
const inFlightUnifiedSearches = new Map<string, Promise<Song[]>>();
let publicHomeSectionsCache: { value: PublicMusicHomeSections; expiresAt: number } | null = null;
let publicHomeSectionsPromise: Promise<PublicMusicHomeSections> | null = null;
let publicArtistDirectoryCache: { value: PublicArtistDirectoryResponse; expiresAt: number } | null = null;
let publicArtistDirectoryPromise: Promise<PublicArtistDirectoryResponse> | null = null;

const getValidCachedValue = <T>(entry?: { value: T; expiresAt: number } | null) => {
	if (!entry) return null;
	if (entry.expiresAt < Date.now()) return null;
	return entry.value;
};

export const searchPublicMusicSongs = async (query: string): Promise<PublicMusicSong[]> => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];
	const cacheKey = trimmedQuery.toLowerCase();
	const cachedSongs = getValidCachedValue(publicSearchCache.get(cacheKey));
	if (cachedSongs) {
		return cachedSongs;
	}
	const inFlightSearch = inFlightPublicSearches.get(cacheKey);
	if (inFlightSearch) {
		return inFlightSearch;
	}

	const request = axiosInstance
		.get("/publicmusic/search", {
			params: { q: trimmedQuery },
		})
		.then((response) => {
			const songs = response.data.songs ?? [];
			publicSearchCache.set(cacheKey, { value: songs, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
			return songs;
		})
		.finally(() => {
			inFlightPublicSearches.delete(cacheKey);
		});

	inFlightPublicSearches.set(cacheKey, request);
	return request;
};

export const fetchPublicMusicCharts = async (scope: "global" | "region", region?: string): Promise<PublicMusicChartResponse> => {
	const cacheKey = `${scope}::${region || ""}`;
	const cachedChart = getValidCachedValue(publicChartCache.get(cacheKey));
	if (cachedChart) {
		return cachedChart;
	}
	const inFlightChart = inFlightPublicCharts.get(cacheKey);
	if (inFlightChart) {
		return inFlightChart;
	}

	const request = axiosInstance
		.get("/publicmusic/charts", {
			params: {
				scope,
				region,
			},
		})
		.then((response) => {
			publicChartCache.set(cacheKey, { value: response.data, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
			return response.data;
		})
		.finally(() => {
			inFlightPublicCharts.delete(cacheKey);
		});

	inFlightPublicCharts.set(cacheKey, request);
	return request;
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
	const normalizedGenre = genre.trim();
	const cacheKey = `${trimmedQuery.toLowerCase()}::${normalizedGenre.toLowerCase()}::${limit}`;
	const cachedResults = getValidCachedValue(unifiedSearchCache.get(cacheKey));
	if (cachedResults) {
		return cachedResults;
	}
	const inFlightSearch = inFlightUnifiedSearches.get(cacheKey);
	if (inFlightSearch) {
		return inFlightSearch;
	}

	const request = Promise.allSettled([
		axiosInstance.get("/songs", {
			params: {
				search: trimmedQuery,
				genre: normalizedGenre || undefined,
				limit,
				offset: 0,
			},
		}),
		trimmedQuery.length >= 2 ? searchPublicMusicSongs(trimmedQuery) : Promise.resolve([]),
	])
		.then(([localResponse, publicSongs]) => {
			const localSongs: Song[] = localResponse.status === "fulfilled" ? localResponse.value.data ?? [] : [];
			const publicMappedSongs =
				publicSongs.status === "fulfilled" ? publicSongs.value.map((song) => mapPublicMusicSongToSong(song, "search-public")) : [];

			const results = mergeUniqueSongs([...localSongs, ...publicMappedSongs]).slice(0, limit);
			unifiedSearchCache.set(cacheKey, { value: results, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS });
			return results;
		})
		.finally(() => {
			inFlightUnifiedSearches.delete(cacheKey);
		});

	inFlightUnifiedSearches.set(cacheKey, request);
	return request;
};

const PUBLIC_ARTIST_DIRECTORY_SEARCHES = {
	global: {
		week: ["top artists this week"],
		month: ["top artists this month"],
	},
	regional: {
		week: ["top artists this week india"],
		month: ["top artists this month india"],
	},
} as const;

export const normalizeArtistName = (artistName: string) =>
	artistName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ");

export const filterSongsByArtistName = (songs: Song[], artistName: string) => {
	const normalizedTarget = normalizeArtistName(artistName);
	if (!normalizedTarget) return [];

	return songs.filter((song) => {
		const normalizedArtist = normalizeArtistName(song.artist);
		return (
			normalizedArtist === normalizedTarget ||
			normalizedArtist.includes(normalizedTarget) ||
			normalizedTarget.includes(normalizedArtist)
		);
	});
};

export const buildPublicArtistCollections = (songs: Song[], songsPerArtist = 4): PublicArtistCollection[] => {
	const artistMap = new Map<
		string,
		{
			id: string;
			name: string;
			imageUrl: string;
			songs: Song[];
			albums: Set<string>;
		}
	>();

	for (const song of songs) {
		const normalizedArtist = song.artist.trim();
		if (!normalizedArtist) continue;

		const key = normalizedArtist.toLowerCase();
		const currentArtist =
			artistMap.get(key) || {
				id: key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || key,
				name: normalizedArtist,
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
		.map((artist) => {
			const artistSongs = artist.songs.slice(0, songsPerArtist);
			return {
				id: artist.id,
				name: artist.name,
				imageUrl: artist.imageUrl,
				songs: artistSongs,
				topSong: artistSongs[0] || null,
				songCount: artist.songs.length,
				albumCount: artist.albums.size,
			};
		})
		.sort((left, right) => {
			if (right.songCount !== left.songCount) {
				return right.songCount - left.songCount;
			}
			return left.name.localeCompare(right.name);
		});
};

const toSectionSongs = (songs: PublicMusicSong[], section: string, limit = PUBLIC_HOME_SECTION_LIMIT) =>
	mergeUniqueSongs(songs.map((song) => mapPublicMusicSongToSong(song, section))).slice(0, limit);

const isMeaningfulAlbum = (albumId: string | null) => {
	const normalizedAlbum = albumId?.trim().toLowerCase();
	return Boolean(normalizedAlbum && normalizedAlbum !== "single" && normalizedAlbum !== "unknown");
};

const buildArtistSpotlights = (songs: Song[]): PublicMusicArtistSpotlight[] => {
	return buildPublicArtistCollections(songs, 3)
		.slice(0, PUBLIC_HOME_SPOTLIGHT_LIMIT)
		.map((artist) => ({
			name: artist.name,
			imageUrl: artist.imageUrl,
			songs: artist.songs,
			songCount: artist.songCount,
			albumCount: artist.albumCount,
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
	const cachedSections = getValidCachedValue(publicHomeSectionsCache);
	if (cachedSections) {
		return cachedSections;
	}
	if (publicHomeSectionsPromise) {
		return publicHomeSectionsPromise;
	}

	publicHomeSectionsPromise = Promise.allSettled([
		fetchPublicMusicCharts("global"),
		fetchPublicMusicCharts("region", "United States"),
		searchPublicMusicSongs("new music releases"),
	]).then(([globalChart, regionalChart, featuredSearch]) => {
		const globalSongs = globalChart.status === "fulfilled" ? globalChart.value.songs : [];
		const regionalSongs = regionalChart.status === "fulfilled" ? regionalChart.value.songs : [];
		const featuredSongs = featuredSearch.status === "fulfilled" ? featuredSearch.value : [];

		const featured = toSectionSongs([...featuredSongs, ...globalSongs.slice(0, 4)], "featured-public");
		const recommended = toSectionSongs([...regionalSongs, ...featuredSongs.slice(0, 2)], "recommended-public");
		const madeForYou = toSectionSongs([...featuredSongs.slice(0, 4), ...globalSongs.slice(0, 4)], "madeforyou-public");
		const trending = toSectionSongs([...globalSongs, ...regionalSongs], "trending-public");
		const library = mergeUniqueSongs([...featured, ...recommended, ...madeForYou, ...trending]);

		const sections = {
			featuredSongs: featured,
			recommendedSongs: recommended,
			madeForYouSongs: madeForYou,
			trendingSongs: trending,
			artists: buildArtistSpotlights(library),
			albums: buildAlbumSpotlights(library),
		};

		publicHomeSectionsCache = { value: sections, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS };
		return sections;
	}).finally(() => {
		publicHomeSectionsPromise = null;
	});

	return publicHomeSectionsPromise;
};

export const fetchPublicArtistDirectory = async (): Promise<PublicArtistDirectoryResponse> => {
	const cachedDirectory = getValidCachedValue(publicArtistDirectoryCache);
	if (cachedDirectory) {
		return cachedDirectory;
	}
	if (publicArtistDirectoryPromise) {
		return publicArtistDirectoryPromise;
	}

	publicArtistDirectoryPromise = Promise.allSettled([
		fetchPublicMusicCharts("global"),
		fetchPublicMusicCharts("region", "India"),
		Promise.all(PUBLIC_ARTIST_DIRECTORY_SEARCHES.global.week.map((query) => searchPublicMusicSongs(query))),
		Promise.all(PUBLIC_ARTIST_DIRECTORY_SEARCHES.global.month.map((query) => searchPublicMusicSongs(query))),
		Promise.all(PUBLIC_ARTIST_DIRECTORY_SEARCHES.regional.week.map((query) => searchPublicMusicSongs(query))),
		Promise.all(PUBLIC_ARTIST_DIRECTORY_SEARCHES.regional.month.map((query) => searchPublicMusicSongs(query))),
	]).then(([globalChart, regionalChart, globalWeekResults, globalMonthResults, regionalWeekResults, regionalMonthResults]) => {
		const globalTodaySongs =
			globalChart.status === "fulfilled"
				? mergeUniqueSongs(globalChart.value.songs.map((song) => mapPublicMusicSongToSong(song, "artists-global-today")))
				: [];
		const regionalTodaySongs =
			regionalChart.status === "fulfilled"
				? mergeUniqueSongs(regionalChart.value.songs.map((song) => mapPublicMusicSongToSong(song, "artists-regional-today")))
				: [];

		const globalWeekSongs =
			globalWeekResults.status === "fulfilled"
				? mergeUniqueSongs(
						globalWeekResults.value.flatMap((songs, index) =>
							songs.map((song) => mapPublicMusicSongToSong(song, `artists-global-week-${index}`))
						)
				  )
				: [];

		const globalMonthSongs =
			globalMonthResults.status === "fulfilled"
				? mergeUniqueSongs(
						globalMonthResults.value.flatMap((songs, index) =>
							songs.map((song) => mapPublicMusicSongToSong(song, `artists-global-month-${index}`))
						)
				  )
				: [];

		const regionalWeekSongs =
			regionalWeekResults.status === "fulfilled"
				? mergeUniqueSongs(
						regionalWeekResults.value.flatMap((songs, index) =>
							songs.map((song) => mapPublicMusicSongToSong(song, `artists-regional-week-${index}`))
						)
				  )
				: [];

		const regionalMonthSongs =
			regionalMonthResults.status === "fulfilled"
				? mergeUniqueSongs(
						regionalMonthResults.value.flatMap((songs, index) =>
							songs.map((song) => mapPublicMusicSongToSong(song, `artists-regional-month-${index}`))
						)
				  )
				: [];

		const directory = {
			global: {
				today: buildPublicArtistCollections(globalTodaySongs),
				week: buildPublicArtistCollections(globalWeekSongs.length > 0 ? globalWeekSongs : globalTodaySongs),
				month: buildPublicArtistCollections(globalMonthSongs.length > 0 ? globalMonthSongs : globalTodaySongs),
			},
			regional: {
				today: buildPublicArtistCollections(regionalTodaySongs),
				week: buildPublicArtistCollections(regionalWeekSongs.length > 0 ? regionalWeekSongs : regionalTodaySongs),
				month: buildPublicArtistCollections(regionalMonthSongs.length > 0 ? regionalMonthSongs : regionalTodaySongs),
			},
		};

		publicArtistDirectoryCache = { value: directory, expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS };
		return directory;
	}).finally(() => {
		publicArtistDirectoryPromise = null;
	});
	return publicArtistDirectoryPromise;
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
