import Topbar from "@/components/Topbar";
import { buildArtistProfileHref } from "@/lib/artistProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { axiosInstance } from "@/lib/axios";
import { buildSongDetailHref } from "@/lib/songDetail";
import { ensureResolvableSong, fetchPublicArtistDirectory } from "@/lib/ytMusic";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { PublicArtistCollection, PublicArtistDirectoryResponse, PublicArtistRange, PublicArtistScope, Song } from "@/types";
import { AudioLines, CalendarDays, Disc3, Loader2, Play, Search, Sparkles, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const RANGE_LABELS: Record<PublicArtistRange, string> = {
	today: "Top Artists Today",
	week: "Top Artists This Week",
	month: "Top Artists This Month",
};

const EMPTY_DIRECTORY: PublicArtistDirectoryResponse = {
	global: {
		today: [],
		week: [],
		month: [],
	},
	regional: {
		today: [],
		week: [],
		month: [],
	},
};

const AllArtistsPage = () => {
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [artistDirectory, setArtistDirectory] = useState<PublicArtistDirectoryResponse>(EMPTY_DIRECTORY);
	const [activeScope, setActiveScope] = useState<PublicArtistScope>("global");
	const [activeRange, setActiveRange] = useState<PublicArtistRange>("today");
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadArtists = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetchPublicArtistDirectory();
				if (!isMounted) return;
				setArtistDirectory(response);
			} catch {
				if (!isMounted) return;
				setError("Artist collections could not be loaded from the public music service right now.");
				setArtistDirectory(EMPTY_DIRECTORY);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadArtists();

		return () => {
			isMounted = false;
		};
	}, []);

	const artists = artistDirectory[activeScope][activeRange];
	const filteredArtists = useMemo(() => {
		const trimmedQuery = searchQuery.trim().toLowerCase();
		if (!trimmedQuery) return artists;

		return artists.filter((artist) => {
			const matchesArtist = artist.name.toLowerCase().includes(trimmedQuery);
			const matchesSong = artist.songs.some(
				(song) =>
					song.title.toLowerCase().includes(trimmedQuery) || song.artist.toLowerCase().includes(trimmedQuery)
			);
			return matchesArtist || matchesSong;
		});
	}, [artists, searchQuery]);

	const featuredArtist = filteredArtists[0] || null;

	const handlePlayArtistSong = async (songs: Song[], startIndex: number) => {
		const song = songs[startIndex];
		if (!song) return;

		const isCurrentSong =
			currentSong?._id === song._id || (currentSong?.externalVideoId && currentSong.externalVideoId === song.externalVideoId);

		if (isCurrentSong) {
			togglePlay();
			return;
		}

		playAlbum(songs, startIndex);

		try {
			const resolvedSong = await ensureResolvableSong(song);
			await axiosInstance.post(`/songs/${resolvedSong._id}/play`);
		} catch (playError: any) {
			toast.error(playError.response?.data?.message || "Playback started, but the play count could not be saved.");
		}
	};

	const renderSongRow = (artist: PublicArtistCollection, song: Song, songIndex: number) => {
		const isCurrentSong =
			currentSong?._id === song._id || (currentSong?.externalVideoId && currentSong.externalVideoId === song.externalVideoId);

		return (
			<div
				key={`${artist.id}-${song.externalVideoId || song._id}`}
				className='flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3'
			>
				<button
					type='button'
					onClick={() => void handlePlayArtistSong(artist.songs, songIndex)}
					className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-emerald-400 hover:text-black'
				>
					{isCurrentSong && isPlaying ? <AudioLines className='h-4 w-4' /> : <Play className='h-4 w-4 fill-current' />}
				</button>

				<img src={song.imageUrl} alt={song.title} className='h-14 w-14 rounded-xl object-cover' />

				<div className='min-w-0 flex-1'>
					<Link to={buildSongDetailHref(song)} state={{ song }} className='block'>
						<p className='truncate font-medium text-white transition hover:text-emerald-300'>{song.title}</p>
					</Link>
					<Link to={buildArtistProfileHref(song.artist)} className='block truncate text-sm text-zinc-400 transition hover:text-sky-300'>
						{song.artist}
					</Link>
				</div>

				<div className='hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-zinc-400 sm:block'>
					{song.albumId || "Single"}
				</div>
			</div>
		);
	};

	return (
		<main className='h-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(180deg,_#050816,_#020617_48%,_#010101)]'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-96px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
						<div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
							<div>
								<div className='inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-200'>
									<Sparkles className='h-3.5 w-3.5' />
									Artist Directory
								</div>
								<h1 className='mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl'>
									Explore all public artists and jump straight into their top songs.
								</h1>
								<p className='mt-4 max-w-2xl text-sm leading-6 text-zinc-300'>
									This page groups artists from the same public music source already used across the song catalog, then lets users
									play tracks with the existing player flow.
								</p>

								<div className='mt-6 flex flex-wrap gap-2 text-xs text-zinc-300'>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Public API artist discovery</span>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Today, week, and month views</span>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Global and regional toggle</span>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Uses the same playback objects as songs</span>
								</div>

								<div className='mt-6 flex flex-col gap-3'>
									<div className='relative min-w-0'>
										<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
										<Input
											value={searchQuery}
											onChange={(event) => setSearchQuery(event.target.value)}
											placeholder='Search artists or songs'
											className='h-12 border-white/10 bg-black/30 pl-11 pr-12 text-white placeholder:text-zinc-500'
										/>
										{searchQuery ? (
											<button
												type='button'
												onClick={() => setSearchQuery("")}
												className='absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-zinc-200 transition hover:bg-white/20 hover:text-white'
												aria-label='Clear search'
											>
												<X className='h-4 w-4' />
											</button>
										) : null}
									</div>
									<div className='w-full'>
										<Tabs value={activeScope} onValueChange={(value) => setActiveScope(value as PublicArtistScope)} className='min-w-0'>
											<TabsList className='grid h-auto w-full grid-cols-2 border border-white/10 bg-black/30 p-1'>
												<TabsTrigger
													value='global'
													className='min-w-0 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black'
												>
													Global
												</TabsTrigger>
												<TabsTrigger
													value='regional'
													className='min-w-0 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black'
												>
													Regional
												</TabsTrigger>
											</TabsList>
										</Tabs>
									</div>
									<div className='w-full'>
										<Tabs value={activeRange} onValueChange={(value) => setActiveRange(value as PublicArtistRange)} className='min-w-0'>
											<TabsList className='grid h-auto w-full grid-cols-3 gap-1 border border-white/10 bg-black/30 p-1'>
												<TabsTrigger
													value='today'
													className='min-w-0 px-2 py-2.5 text-[11px] leading-tight sm:px-3 sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black'
												>
													Today
												</TabsTrigger>
												<TabsTrigger
													value='week'
													className='min-w-0 px-2 py-2.5 text-[11px] leading-tight sm:px-3 sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black'
												>
													Week
												</TabsTrigger>
												<TabsTrigger
													value='month'
													className='min-w-0 px-2 py-2.5 text-[11px] leading-tight sm:px-3 sm:text-sm data-[state=active]:bg-white data-[state=active]:text-black'
												>
													Month
												</TabsTrigger>
											</TabsList>
										</Tabs>
									</div>
								</div>
							</div>

							<div className='rounded-[28px] border border-white/10 bg-black/35 p-5'>
								{featuredArtist ? (
									<div className='flex h-full flex-col'>
										<div className='flex items-center gap-4'>
											<img
												src={featuredArtist.imageUrl}
												alt={featuredArtist.name}
												className='h-24 w-24 rounded-[28px] object-cover ring-1 ring-white/10'
											/>
											<div className='min-w-0'>
												<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Featured artist</p>
												<Link to={buildArtistProfileHref(featuredArtist.name)} className='block'>
													<h2 className='truncate text-2xl font-semibold text-white transition hover:text-sky-300'>{featuredArtist.name}</h2>
												</Link>
												<p className='mt-2 text-sm text-zinc-300'>
													{featuredArtist.songCount} songs surfaced in this range
												</p>
											</div>
										</div>

										<div className='mt-5 grid gap-3 sm:grid-cols-3'>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Scope</p>
												<p className='mt-2 text-lg font-semibold text-white'>{activeScope === "global" ? "Global" : "Regional (India)"}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Range</p>
												<p className='mt-2 text-lg font-semibold text-white'>{RANGE_LABELS[activeRange]}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Artists</p>
												<p className='mt-2 text-3xl font-semibold text-white'>{filteredArtists.length}</p>
											</div>
										</div>

										{featuredArtist.topSong ? (
											<div className='mt-5 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-4'>
												<div className='flex items-center justify-between gap-3'>
													<div className='min-w-0'>
														<p className='text-xs uppercase tracking-[0.2em] text-emerald-100/80'>Top song right now</p>
														<p className='mt-2 truncate text-lg font-semibold text-white'>{featuredArtist.topSong.title}</p>
														<Link to={buildArtistProfileHref(featuredArtist.topSong.artist)} className='block truncate text-sm text-emerald-50/80 transition hover:text-white'>
															{featuredArtist.topSong.artist}
														</Link>
													</div>
													<Button
														type='button'
														onClick={() => void handlePlayArtistSong(featuredArtist.songs, 0)}
														className='bg-white text-black hover:bg-emerald-100'
													>
														<Play className='mr-2 h-4 w-4 fill-current' />
														Play
													</Button>
												</div>
											</div>
										) : null}
									</div>
								) : (
									<div className='flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center'>
										<Disc3 className='h-10 w-10 text-white/70' />
										<p className='mt-4 text-lg font-medium text-white'>No artists found for this selection.</p>
										<p className='mt-2 max-w-sm text-sm text-zinc-400'>Try another search or switch between global, regional, today, week, and month.</p>
									</div>
								)}
							</div>
						</div>
					</section>

					<section className='mt-8 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5'>
						<div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
							<div>
								<h2 className='text-xl font-semibold text-white'>
									{activeScope === "global" ? "Global" : "Regional (India)"} | {RANGE_LABELS[activeRange]}
								</h2>
								<p className='text-sm text-zinc-400'>Artists are grouped from public song results, then sorted by how many songs surfaced.</p>
							</div>
							<div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'>
								<CalendarDays className='h-3.5 w-3.5' />
								{filteredArtists.length} artists
							</div>
						</div>

						{error ? (
							<div className='rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100'>{error}</div>
						) : isLoading ? (
							<div className='flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
								<div className='flex items-center gap-3 text-sm text-zinc-300'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading artists...
								</div>
							</div>
						) : filteredArtists.length === 0 ? (
							<div className='rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400'>
								No artists matched this search.
							</div>
						) : (
							<div className='grid gap-4 xl:grid-cols-2'>
								{filteredArtists.map((artist, index) => (
									<article
										key={`${activeScope}-${activeRange}-${artist.id}`}
										className='rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,38,0.95),rgba(6,9,16,0.98))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)]'
									>
										<div className='flex items-start gap-4'>
											<img src={artist.imageUrl} alt={artist.name} className='h-20 w-20 rounded-[24px] object-cover ring-1 ring-white/10' />
											<div className='min-w-0 flex-1'>
												<div className='flex flex-wrap items-center gap-2'>
													<span className='rounded-full border border-sky-400/20 bg-sky-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-sky-200'>
														#{index + 1}
													</span>
													<span className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-400'>
														<TrendingUp className='mr-1 inline h-3 w-3' />
														{artist.songCount} songs
													</span>
												</div>
												<Link to={buildArtistProfileHref(artist.name)} className='mt-3 block truncate text-2xl font-semibold text-white transition hover:text-sky-300'>
													{artist.name}
												</Link>
												<p className='mt-2 text-sm text-zinc-400'>
													{artist.albumCount} albums spotted across the current public results.
												</p>
											</div>
										</div>

										<div className='mt-5 space-y-3'>
											{artist.songs.map((song, songIndex) => renderSongRow(artist, song, songIndex))}
										</div>
									</article>
								))}
							</div>
						)}
					</section>
				</div>
			</ScrollArea>
		</main>
	);
};

export default AllArtistsPage;
