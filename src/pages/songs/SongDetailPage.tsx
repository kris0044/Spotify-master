import SongActions from "@/components/SongActions";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { buildSongDetailHref, getSongFromDetailParams } from "@/lib/songDetail";
import { ensureResolvableSong, searchUnifiedSongs } from "@/lib/ytMusic";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Song } from "@/types";
import { Clock3, Copy, ExternalLink, ListPlus, Loader2, Music2, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useParams } from "react-router-dom";

const formatDuration = (seconds: number) => {
	if (!seconds) {
		return "Unknown";
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatSource = (song: Song) => {
	if (song.source === "youtube_music" || song.externalVideoId) {
		return "Public API";
	}

	return "Library";
};

const isZeroDate = (value?: string) => !value || value.startsWith("1970-01-01");

const SongDetailPage = () => {
	const { songId = "" } = useParams<{ songId: string }>();
	const location = useLocation();
	const [song, setSong] = useState<Song | null>(() => (location.state as { song?: Song } | null)?.song || null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
	const [songSearch, setSongSearch] = useState("");
	const [searchResults, setSearchResults] = useState<Song[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [addingSongId, setAddingSongId] = useState<string | null>(null);

	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

	useEffect(() => {
		let isMounted = true;

		const loadSong = async () => {
			const decodedSongId = decodeURIComponent(songId);
			const stateSong = (location.state as { song?: Song } | null)?.song;
			if (stateSong && stateSong._id === decodedSongId) {
				setSong(stateSong);
				setError(null);
				return;
			}

			const params = new URLSearchParams(location.search);
			const songFromParams = getSongFromDetailParams(decodedSongId, params);
			if (songFromParams) {
				setSong(songFromParams);
				setError(null);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = await axiosInstance.get<Song>(`/songs/${decodedSongId}`);
				if (!isMounted) return;
				setSong(response.data);
			} catch (loadError: any) {
				if (!isMounted) return;
				setError(loadError.response?.data?.message || "Song not found");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadSong();
		return () => {
			isMounted = false;
		};
	}, [location.search, location.state, songId]);

	useEffect(() => {
		void fetchPlaylists();
	}, [fetchPlaylists]);

	useEffect(() => {
		let isMounted = true;

		const loadSearchResults = async () => {
			const trimmed = songSearch.trim();
			if (!trimmed) {
				setSearchResults([]);
				setIsSearching(false);
				return;
			}

			setIsSearching(true);
			try {
				const results = await searchUnifiedSongs(trimmed, "", 16);
				if (!isMounted) return;
				setSearchResults(results);
			} catch {
				if (!isMounted) return;
				setSearchResults([]);
			} finally {
				if (isMounted) {
					setIsSearching(false);
				}
			}
		};

		void loadSearchResults();

		return () => {
			isMounted = false;
		};
	}, [songSearch]);

	const isCurrentSong = currentSong?._id === song?._id;
	const createdDate = useMemo(() => {
		if (!song?.createdAt || isZeroDate(song.createdAt)) {
			return "Public music result";
		}

		return new Date(song.createdAt).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}, [song]);

	const filteredResults = useMemo(() => {
		if (!song) {
			return searchResults;
		}

		return searchResults.filter((candidate) => {
			const sameId = candidate._id === song._id;
			const sameExternal = candidate.externalVideoId && candidate.externalVideoId === song.externalVideoId;
			return !sameId && !sameExternal;
		});
	}, [searchResults, song]);

	const handlePlay = () => {
		if (!song) return;
		if (isCurrentSong) {
			togglePlay();
			return;
		}

		playAlbum([song], 0);
	};

	const handleCopyLink = async () => {
		if (!song) return;

		try {
			const absoluteUrl = `${window.location.origin}${buildSongDetailHref(song)}`;
			await navigator.clipboard.writeText(absoluteUrl);
			toast.success("Song link copied");
		} catch {
			toast.error("Failed to copy song link");
		}
	};

	const handleAddFoundSongToPlaylist = async (candidate: Song) => {
		if (!selectedPlaylistId) {
			toast.error("Select a playlist first");
			return;
		}

		setAddingSongId(candidate._id);
		try {
			const actionableSong = await ensureResolvableSong(candidate);
			await addSongToPlaylist(selectedPlaylistId, actionableSong._id);
		} finally {
			setAddingSongId(null);
		}
	};

	if (isLoading) {
		return (
			<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-950 via-black to-black'>
				<Topbar />
				<div className='flex h-[calc(100vh-180px)] items-center justify-center text-zinc-400'>
					<Loader2 className='mr-2 h-5 w-5 animate-spin' />
					Loading song...
				</div>
			</main>
		);
	}

	if (!song || error) {
		return (
			<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-950 via-black to-black'>
				<Topbar />
				<div className='flex h-[calc(100vh-180px)] items-center justify-center px-4'>
					<div className='rounded-3xl border border-white/10 bg-white/5 p-8 text-center'>
						<h1 className='text-2xl font-semibold text-white'>Song not found</h1>
						<p className='mt-3 text-sm text-zinc-400'>{error || "We couldn't load this song."}</p>
						<Button asChild className='mt-6 bg-white text-black hover:bg-zinc-200'>
							<Link to='/songs'>Back to songs</Link>
						</Button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-950 via-black to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_24%),linear-gradient(160deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]'>
						<div className='grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]'>
							<div className='overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-2xl'>
								<img src={song.imageUrl} alt={song.title} className='aspect-square h-full w-full object-cover' />
							</div>

							<div className='flex flex-col justify-between gap-6'>
								<div>
									<div className='mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300'>
										<Music2 className='h-3.5 w-3.5' />
										Song Detail
									</div>
									<h1 className='text-4xl font-semibold tracking-tight text-white sm:text-5xl'>{song.title}</h1>
									<p className='mt-3 text-lg text-zinc-300'>{song.artist}</p>

									<div className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
										<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
											<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Duration</p>
											<p className='mt-2 text-lg font-semibold text-white'>{formatDuration(song.duration)}</p>
										</div>
										<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
											<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Genre</p>
											<p className='mt-2 text-lg font-semibold text-white'>{song.genre || "Unknown"}</p>
										</div>
										<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
											<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Source</p>
											<p className='mt-2 text-lg font-semibold text-white'>{formatSource(song)}</p>
										</div>
										<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
											<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Plays</p>
											<p className='mt-2 text-lg font-semibold text-white'>{song.playCount || 0}</p>
										</div>
									</div>

									<div className='mt-6 flex flex-wrap gap-2 text-sm text-zinc-400'>
										<div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
											<Clock3 className='h-4 w-4' />
											Added {createdDate}
										</div>
										{song.externalVideoId ? (
											<div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
												External ID {song.externalVideoId}
											</div>
										) : null}
										{song.albumId ? (
											<div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5'>
												Album {song.albumId}
											</div>
										) : null}
									</div>
								</div>

								<div className='flex flex-wrap items-center gap-3'>
									<Button onClick={handlePlay} className='bg-green-500 text-black hover:bg-green-400'>
										{isCurrentSong && isPlaying ? <Pause className='mr-2 h-4 w-4' /> : <Play className='mr-2 h-4 w-4' />}
										{isCurrentSong && isPlaying ? "Pause" : "Play"}
									</Button>
									<div className='rounded-full border border-white/10 bg-white/5 p-1'>
										<SongActions song={song} />
									</div>
									<Button variant='outline' onClick={handleCopyLink} className='border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10'>
										<Copy className='mr-2 h-4 w-4' />
										Copy Link
									</Button>
									{song.playbackUrl ? (
										<Button asChild variant='outline' className='border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10'>
											<a href={song.playbackUrl} target='_blank' rel='noreferrer'>
												<ExternalLink className='mr-2 h-4 w-4' />
												Open Source
											</a>
										</Button>
									) : null}
								</div>
							</div>
						</div>
					</section>

					<section className='mt-8 rounded-[30px] border border-white/10 bg-zinc-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)]'>
						<div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
							<div>
								<h2 className='text-2xl font-semibold text-white'>Add another song to a playlist</h2>
								<p className='mt-2 max-w-2xl text-sm text-zinc-400'>
									Select one of your playlists, then search songs from your library and the public music API in one place.
								</p>
							</div>
							<div className='w-full max-w-sm'>
								<Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
									<SelectTrigger className='border-white/10 bg-white/5 text-white'>
										<SelectValue placeholder='Select a playlist' />
									</SelectTrigger>
									<SelectContent>
										{playlists.map((playlist) => (
											<SelectItem key={playlist._id} value={playlist._id}>
												{playlist.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className='mt-5'>
							<Input
								value={songSearch}
								onChange={(event) => setSongSearch(event.target.value)}
								placeholder='Search songs from local library and public API'
								className='h-12 border-white/10 bg-white/5 text-white placeholder:text-zinc-500'
							/>
						</div>

						<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
							{isSearching ? (
								<div className='col-span-full flex items-center justify-center rounded-3xl border border-dashed border-white/10 py-12 text-zinc-400'>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Searching songs...
								</div>
							) : filteredResults.length ? (
								filteredResults.map((candidate) => (
									<div key={candidate._id} className='rounded-[26px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.07]'>
										<div className='flex gap-4'>
											<Link to={buildSongDetailHref(candidate)} state={{ song: candidate }} className='shrink-0'>
												<img src={candidate.imageUrl} alt={candidate.title} className='h-20 w-20 rounded-2xl object-cover' />
											</Link>
											<div className='min-w-0 flex-1'>
												<Link to={buildSongDetailHref(candidate)} state={{ song: candidate }} className='block'>
													<h3 className='truncate text-lg font-semibold text-white transition hover:text-emerald-300'>{candidate.title}</h3>
													<p className='truncate text-sm text-zinc-400'>{candidate.artist}</p>
												</Link>
												<p className='mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500'>
													{candidate.genre || "Unknown"} | {formatSource(candidate)}
												</p>
												<p className='mt-1 text-xs text-zinc-500'>{formatDuration(candidate.duration)}</p>
											</div>
										</div>
										<div className='mt-4 flex gap-2'>
											<Button
												onClick={() => void handleAddFoundSongToPlaylist(candidate)}
												disabled={!selectedPlaylistId || addingSongId === candidate._id}
												className='flex-1 bg-white text-black hover:bg-zinc-200'
											>
												{addingSongId === candidate._id ? (
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
												) : (
													<ListPlus className='mr-2 h-4 w-4' />
												)}
												Add to Playlist
											</Button>
											<Button variant='outline' onClick={() => playAlbum([candidate], 0)} className='border-white/10 bg-transparent text-zinc-100 hover:bg-white/10'>
												<Play className='h-4 w-4' />
											</Button>
										</div>
									</div>
								))
							) : songSearch.trim() ? (
								<div className='col-span-full rounded-3xl border border-dashed border-white/10 py-12 text-center text-zinc-500'>
									No songs found for this search.
								</div>
							) : (
								<div className='col-span-full rounded-3xl border border-dashed border-white/10 py-12 text-center text-zinc-500'>
									Start typing to search songs from your library and the public API.
								</div>
							)}
						</div>
					</section>
				</div>
			</ScrollArea>
		</main>
	);
};

export default SongDetailPage;
