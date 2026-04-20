/* eslint-disable react-hooks/exhaustive-deps */
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchPublicMusicHomeSections, mergeUniqueSongs, searchUnifiedSongs } from "@/lib/ytMusic";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { PublicMusicHomeSections, Song } from "@/types";
import { Sparkles, Search, ArrowUpRight, Disc3, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FeaturedSection from "./components/FeaturedSection";
import PublicMusicSpotlight from "./components/PublicMusicSpotlight";
import SectionGrid from "./components/SectionGrid";
import { useAuth } from "@clerk/clerk-react";

const emptyPublicSections: PublicMusicHomeSections = {
	featuredSongs: [],
	recommendedSongs: [],
	madeForYouSongs: [],
	trendingSongs: [],
	artists: [],
	albums: [],
};
const INPUT_DEBOUNCE_MS = 350;

const normalizeSearchValue = (value?: string | null) => (value || "").trim().toLowerCase();

const splitSearchTokens = (value: string) =>
	normalizeSearchValue(value)
		.split(/\s+/)
		.filter(Boolean);

const songMatchesMetadata = (song: Song, query: string, extraKeywords: string[] = []) => {
	const normalizedQuery = normalizeSearchValue(query);
	if (!normalizedQuery) return false;

	const searchableValues = [
		song.title,
		song.artist,
		song.albumId,
		song.genre,
		song.source,
		...extraKeywords,
	]
		.map((value) => normalizeSearchValue(value))
		.filter(Boolean);

	if (searchableValues.some((value) => value.includes(normalizedQuery))) {
		return true;
	}

	const tokens = splitSearchTokens(normalizedQuery);
	if (tokens.length === 0) return false;

	return tokens.every((token) => searchableValues.some((value) => value.includes(token)));
};

const HomePage = () => {
	const {
		fetchFeaturedSongs,
		fetchMadeForYouSongs,
		fetchTrendingSongs,
		isLoading,
		madeForYouSongs,
		featuredSongs,
		trendingSongs,
	} = useMusicStore();
	const { recommendations, fetchRecommendations } = useRecommendationStore();
	const { isSignedIn } = useAuth();
	const { initializeQueue } = usePlayerStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [publicSections, setPublicSections] = useState<PublicMusicHomeSections>(emptyPublicSections);
	const [searchResults, setSearchResults] = useState<Song[]>([]);

	useEffect(() => {
		void fetchFeaturedSongs();
		void fetchMadeForYouSongs();
		void fetchTrendingSongs();
		if (isSignedIn) {
			void fetchRecommendations();
		}
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchRecommendations, isSignedIn]);

	useEffect(() => {
		let isMounted = true;

		const loadPublicSections = async () => {
			try {
				const response = await fetchPublicMusicHomeSections();
				if (!isMounted) return;
				setPublicSections(response);
			} catch {
				if (!isMounted) return;
				setPublicSections(emptyPublicSections);
			}
		};

		void loadPublicSections();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, INPUT_DEBOUNCE_MS);

		return () => window.clearTimeout(timeoutId);
	}, [searchQuery]);

	useEffect(() => {
		let isMounted = true;

		const loadSearchResults = async () => {
			const trimmedQuery = debouncedSearchQuery.trim();
			if (!trimmedQuery) {
				setSearchResults([]);
				return;
			}

			try {
				const results = await searchUnifiedSongs(trimmedQuery, "", 12);
				if (!isMounted) return;
				setSearchResults(results);
			} catch {
				if (!isMounted) return;
				setSearchResults([]);
			}
		};

		void loadSearchResults();

		return () => {
			isMounted = false;
		};
	}, [debouncedSearchQuery]);

	const featuredFeed = useMemo(
		() => mergeUniqueSongs([...featuredSongs, ...publicSections.featuredSongs]),
		[featuredSongs, publicSections.featuredSongs]
	);
	const madeForYouFeed = useMemo(
		() => mergeUniqueSongs([...madeForYouSongs, ...publicSections.madeForYouSongs]),
		[madeForYouSongs, publicSections.madeForYouSongs]
	);
	const trendingFeed = useMemo(
		() => mergeUniqueSongs([...trendingSongs, ...publicSections.trendingSongs]),
		[trendingSongs, publicSections.trendingSongs]
	);
	const recommendationFeed = useMemo(
		() => mergeUniqueSongs([...recommendations, ...publicSections.recommendedSongs]),
		[recommendations, publicSections.recommendedSongs]
	);
	const homeQueue = useMemo(
		() => mergeUniqueSongs([...featuredFeed, ...madeForYouFeed, ...trendingFeed, ...recommendationFeed]),
		[featuredFeed, madeForYouFeed, trendingFeed, recommendationFeed]
	);

	useEffect(() => {
		if (homeQueue.length > 0) {
			initializeQueue(homeQueue);
		}
	}, [homeQueue, initializeQueue]);

	const normalizedSearch = searchQuery.trim().toLowerCase();
	const matchesSearch = (value?: string | null) => (value || "").toLowerCase().includes(normalizedSearch);

	const filteredFeatured = useMemo(
		() =>
			featuredFeed.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[featuredFeed, normalizedSearch]
	);

	const filteredMadeForYou = useMemo(
		() =>
			madeForYouFeed.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[madeForYouFeed, normalizedSearch]
	);

	const filteredTrending = useMemo(
		() =>
			trendingFeed.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[trendingFeed, normalizedSearch]
	);

	const filteredRecommendations = useMemo(
		() =>
			recommendationFeed.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[recommendationFeed, normalizedSearch]
	);

	const filteredPublicArtists = useMemo(
		() =>
			publicSections.artists.filter(
				(artist) =>
					matchesSearch(artist.name) ||
					artist.songs.some((song) => matchesSearch(song.title) || matchesSearch(song.albumId))
			),
		[publicSections.artists, normalizedSearch]
	);

	const filteredPublicAlbums = useMemo(
		() =>
			publicSections.albums.filter(
				(album) =>
					matchesSearch(album.title) ||
					matchesSearch(album.artist) ||
					album.songs.some((song) => matchesSearch(song.title))
			),
		[publicSections.albums, normalizedSearch]
	);

	const contextualSearchResults = useMemo(() => {
		if (!normalizedSearch) {
			return [];
		}

		const songPool = [
			...featuredFeed.map((song) => ({ song, keywords: ["featured", "editor spotlight", "popular"] })),
			...madeForYouFeed.map((song) => ({ song, keywords: ["made for you", "mix", "personalized"] })),
			...trendingFeed.map((song) => ({ song, keywords: ["trending", "viral", "popular", "hot"] })),
			...recommendationFeed.map((song) => ({ song, keywords: ["recommended", "for you", "picked"] })),
			...publicSections.artists.flatMap((artist) =>
				artist.songs.map((song) => ({
					song,
					keywords: [artist.name, "artist", "top artist"],
				}))
			),
			...publicSections.albums.flatMap((album) =>
				album.songs.map((song) => ({
					song,
					keywords: [album.title, album.artist, "album", "record"],
				}))
			),
		];

		return mergeUniqueSongs(
			songPool
				.filter(({ song, keywords }) => songMatchesMetadata(song, normalizedSearch, keywords))
				.map(({ song }) => song)
		);
	}, [
		featuredFeed,
		madeForYouFeed,
		trendingFeed,
		recommendationFeed,
		publicSections.artists,
		publicSections.albums,
		normalizedSearch,
	]);

	const combinedSearchResults = useMemo(
		() => mergeUniqueSongs([...contextualSearchResults, ...searchResults]),
		[contextualSearchResults, searchResults]
	);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-950 via-black to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.24),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(150deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]'>
						<div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
							<div className='max-w-2xl'>
								<div className='mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-emerald-300'>
									<Sparkles className='h-3.5 w-3.5' />
									Personalized listening
								</div>
								<h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl'>
									Find your next favorite track faster.
								</h1>
								<p className='mt-4 max-w-xl text-sm leading-6 text-zinc-300'>
									Explore featured drops, trending songs, tailored picks, and public music discoveries in a cleaner, richer listening space.
								</p>
							</div>
						</div>

						<div className='mt-6'>
							<div className='relative max-w-2xl'>
								<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
								<Input
									placeholder='Search songs, artists, albums, genres, or trending keywords'
									className='h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</section>

					<section className='mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-300'>
						<div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1'>
							<Radio className='h-3.5 w-3.5 text-red-300' />
							Public API songs now flow into Featured, Recommended, Made For You, and Trending
						</div>
						<Button asChild variant='outline' className='h-8 border-white/10 bg-white/5 px-3 text-xs text-zinc-200 hover:bg-white/10 hover:text-white'>
							<Link to='/publicmusic/top100'>Browse Public Top 100</Link>
						</Button>
					</section>

					<PublicMusicSpotlight artists={filteredPublicArtists} albums={filteredPublicAlbums} />

					{searchQuery.trim() && (
						<div className='mt-8'>
							<SectionGrid title='Search Results' songs={combinedSearchResults} isLoading={false} />
						</div>
					)}

					<div className='mt-8'>
						<div className='mb-5 flex items-center justify-between gap-4'>
							<div>
								<div className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-400'>
									<Disc3 className='h-3.5 w-3.5' />
									Editor spotlight
								</div>
								<h2 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>Featured</h2>
							</div>
							<Button asChild variant='outline' className='border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white'>
								<Link to='/songs'>
									See All
									<ArrowUpRight className='h-4 w-4' />
								</Link>
							</Button>
						</div>
						<FeaturedSection songs={filteredFeatured} />
					</div>

					<div className='mt-8 space-y-2'>
						{(isSignedIn || publicSections.recommendedSongs.length > 0) && filteredRecommendations.length > 0 && (
							<SectionGrid title='Recommended For You' songs={filteredRecommendations} isLoading={false} />
						)}
						<SectionGrid title='Made For You' songs={filteredMadeForYou} isLoading={isLoading} />
						<SectionGrid title='Trending Now' songs={filteredTrending} isLoading={isLoading} />
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};

export default HomePage;
