import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { resolvePublicMusicSong, searchPublicMusicSongs } from "@/lib/ytMusic";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { useFollowStore } from "@/stores/useFollowStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import type { PublicMusicSong, Song } from "@/types";
import { Bell, BellOff, Heart, ListPlus, Loader2, Music4, PlayCircle, Plus, Radio, Search, Youtube } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const INITIAL_QUERY = "Trending music";

const formatDuration = (duration: number | null) => {
	if (!duration) return "Unknown";

	const minutes = Math.floor(duration / 60);
	const seconds = duration % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const PublicMusicPage = () => {
	const { user } = useAuthStore();
	const { favorites, fetchFavorites, addToFavorites, removeFromFavorites } = useFavoriteStore();
	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const { fetchFollowing, isFollowingSong, followSong, unfollowSong, isHydrated } = useFollowStore();
	const { upNextQueue, addToUpNextQueue, fetchUpNextQueue } = usePlayerStore();
	const { recentlyPlayed, fetchRecentHistory } = useHistoryStore();

	const [query, setQuery] = useState(INITIAL_QUERY);
	const [searchInput, setSearchInput] = useState(INITIAL_QUERY);
	const [results, setResults] = useState<PublicMusicSong[]>([]);
	const [activeSong, setActiveSong] = useState<PublicMusicSong | null>(null);
	const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [resolvedSongs, setResolvedSongs] = useState<Record<string, Song>>({});
	const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
	const [selectedSong, setSelectedSong] = useState<PublicMusicSong | null>(null);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
	const [playlistSearch, setPlaylistSearch] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadSongs = async () => {
			setIsLoading(true);
			setError("");

			try {
				const songs = await searchPublicMusicSongs(query);
				if (!isMounted) return;

				setResults(songs);
				setActiveSong(null);
				setHasStartedPlayback(false);
			} catch {
				if (!isMounted) return;
				setError("YouTube Music search could not load right now from the server. Please try again in a moment.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadSongs();

		return () => {
			isMounted = false;
		};
	}, [query]);

	useEffect(() => {
		if (!user) return;

		void fetchFavorites();
		void fetchUpNextQueue();
		void fetchRecentHistory();
		if (!isHydrated) {
			void fetchFollowing();
		}
	}, [user, fetchFavorites, fetchUpNextQueue, fetchRecentHistory, fetchFollowing, isHydrated]);

	const favoriteVideoIds = useMemo(
		() => new Set(favorites.map((song) => song.externalVideoId).filter(Boolean)),
		[favorites]
	);
	const queueVideoIds = useMemo(
		() => new Set(upNextQueue.map((song) => song.externalVideoId).filter(Boolean)),
		[upNextQueue]
	);
	const publicHistory = useMemo(
		() => recentlyPlayed.filter((entry) => entry.song.source === "youtube_music" || entry.song.externalVideoId),
		[recentlyPlayed]
	);
	const filteredPlaylists = useMemo(
		() =>
			playlists.filter((playlist) =>
				playlist.name.toLowerCase().includes(playlistSearch.trim().toLowerCase())
			),
		[playlists, playlistSearch]
	);

	const updateSongReference = (song: PublicMusicSong, internalSongId: string) => {
		const nextSong = { ...song, internalSongId };
		setResults((currentSongs) =>
			currentSongs.map((currentSong) =>
				currentSong.videoId === song.videoId ? { ...currentSong, internalSongId } : currentSong
			)
		);
		setActiveSong((currentSong) =>
			currentSong?.videoId === song.videoId ? { ...currentSong, internalSongId } : currentSong
		);
		setSelectedSong((currentSong) =>
			currentSong?.videoId === song.videoId ? { ...currentSong, internalSongId } : currentSong
		);
		return nextSong;
	};

	const ensureInternalSong = async (song: PublicMusicSong) => {
		const cachedSong = resolvedSongs[song.videoId];
		if (cachedSong) {
			if (!song.internalSongId) {
				updateSongReference(song, cachedSong._id);
			}
			return cachedSong;
		}

		const resolvedSong = await resolvePublicMusicSong(song);
		setResolvedSongs((currentSongs) => ({ ...currentSongs, [song.videoId]: resolvedSong }));
		updateSongReference(song, resolvedSong._id);
		return resolvedSong;
	};

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedQuery = searchInput.trim();
		if (!trimmedQuery) return;
		setQuery(trimmedQuery);
	};

	const requireSignedIn = () => {
		if (user) return true;
		toast.error("Please sign in to use favorites, playlists, queue, and notifications.");
		return false;
	};

	const handlePlaySong = async (song: PublicMusicSong) => {
		setActiveSong(song);
		setHasStartedPlayback(true);

		try {
			const resolvedSong = await ensureInternalSong(song);
			await axiosInstance.post(`/songs/${resolvedSong._id}/play`);
			await fetchRecentHistory();
		} catch (playError: any) {
			console.error("Failed to record public music play", playError);
		}
	};

	const handleFavoriteToggle = async (song: PublicMusicSong) => {
		if (!requireSignedIn()) return;

		try {
			const resolvedSong = await ensureInternalSong(song);
			const isFavorite = favoriteVideoIds.has(song.videoId);

			if (isFavorite) {
				await removeFromFavorites(resolvedSong._id);
			} else {
				await addToFavorites(resolvedSong._id);
			}
		} catch (favoriteError: any) {
			toast.error(favoriteError.response?.data?.message || "Failed to update favorites");
		}
	};

	const handleAddToQueue = async (song: PublicMusicSong) => {
		if (!requireSignedIn()) return;

		try {
			const resolvedSong = await ensureInternalSong(song);
			await addToUpNextQueue(resolvedSong);
		} catch (queueError: any) {
			toast.error(queueError.response?.data?.message || "Failed to add song to queue");
		}
	};

	const handleToggleNotification = async (song: PublicMusicSong) => {
		if (!requireSignedIn()) return;

		try {
			const resolvedSong = await ensureInternalSong(song);
			const isFollowing = isFollowingSong(resolvedSong._id);

			if (isFollowing) {
				await unfollowSong(resolvedSong._id);
				toast.success("Notification removed for this song");
			} else {
				await followSong(resolvedSong._id);
				toast.success("Notification enabled for this song");
			}
		} catch (notificationError: any) {
			toast.error(notificationError.response?.data?.message || "Failed to update notification");
		}
	};

	const openPlaylistDialog = async (song: PublicMusicSong) => {
		if (!requireSignedIn()) return;

		setSelectedSong(song);
		setSelectedPlaylistId("");
		setPlaylistSearch("");
		setIsPlaylistDialogOpen(true);
		await fetchPlaylists();
	};

	const handleSaveToPlaylist = async () => {
		if (!selectedSong || !selectedPlaylistId) return;

		try {
			const resolvedSong = await ensureInternalSong(selectedSong);
			await addSongToPlaylist(selectedPlaylistId, resolvedSong._id);
			setIsPlaylistDialogOpen(false);
		} catch (playlistError: any) {
			toast.error(playlistError.response?.data?.message || "Failed to add song to playlist");
		}
	};

	return (
		<main className='h-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.2),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(234,179,8,0.18),_transparent_22%),linear-gradient(180deg,_#120707,_#050505_48%,_#000000)]'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-96px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
						<div className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
							<div>
								<div className='inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-red-200'>
									<Youtube className='h-3.5 w-3.5' />
									Public Music
								</div>
								<h1 className='mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl'>
									Search YouTube Music and use your real app APIs.
								</h1>
								<p className='mt-4 max-w-2xl text-sm leading-6 text-zinc-300'>
									Public Music now resolves tracks into your existing song system before adding them to favorites,
									queue, playlists, notifications, and history.
								</p>

								<form className='mt-6 flex flex-col gap-3 md:flex-row' onSubmit={handleSearch}>
									<div className='relative flex-1'>
										<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
										<Input
											value={searchInput}
											onChange={(event) => setSearchInput(event.target.value)}
											placeholder='Search songs or artists on YouTube Music'
											className='h-12 border-white/10 bg-black/30 pl-11 text-white placeholder:text-zinc-500'
										/>
									</div>
									<Button type='submit' className='h-12 bg-red-500 px-6 text-white hover:bg-red-400'>
										<Search className='mr-2 h-4 w-4' />
										Search
									</Button>
								</form>

								<div className='mt-4 flex flex-wrap gap-2 text-xs text-zinc-300'>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>No autoplay on search load</span>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Uses your existing favorites API</span>
									<span className='rounded-full border border-white/10 bg-white/5 px-3 py-1'>Uses your existing playlist and queue APIs</span>
								</div>
								<div className='mt-5'>
									<Link to='/publicmusic/top100'>
										<Button variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10'>
											Open Global and Region Top 100
										</Button>
									</Link>
								</div>
							</div>

							<div className='rounded-[28px] border border-white/10 bg-black/40 p-4'>
								{activeSong && hasStartedPlayback ? (
									<div className='space-y-4'>
										<div className='aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black'>
											<iframe
												key={activeSong.videoId}
												className='h-full w-full'
												src={`https://www.youtube.com/embed/${activeSong.videoId}?autoplay=1&rel=0`}
												title={activeSong.title}
												allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
												referrerPolicy='strict-origin-when-cross-origin'
												allowFullScreen
											/>
										</div>

										<div className='flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4'>
											{activeSong.thumbnailUrl ? (
												<img src={activeSong.thumbnailUrl} alt={activeSong.title} className='h-16 w-16 rounded-xl object-cover' />
											) : (
												<div className='flex h-16 w-16 items-center justify-center rounded-xl bg-white/10'>
													<Music4 className='h-7 w-7 text-white/70' />
												</div>
											)}
											<div className='min-w-0 flex-1'>
												<p className='truncate text-lg font-semibold text-white'>{activeSong.title}</p>
												<p className='truncate text-sm text-zinc-300'>{activeSong.artist}</p>
												<p className='mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500'>
													{activeSong.album ?? "YouTube Music"} | {formatDuration(activeSong.duration)}
												</p>
											</div>
										</div>

										<div className='grid gap-3 sm:grid-cols-3'>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Favorites</p>
												<p className='mt-2 text-2xl font-semibold text-white'>{favorites.length}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Queue</p>
												<p className='mt-2 text-2xl font-semibold text-white'>{upNextQueue.length}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>History</p>
												<p className='mt-2 text-2xl font-semibold text-white'>{publicHistory.length}</p>
											</div>
										</div>
									</div>
								) : (
									<div className='flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 text-center'>
										<Radio className='h-10 w-10 text-white/70' />
										<p className='mt-4 text-lg font-medium text-white'>Pick a song to start playing.</p>
										<p className='mt-2 max-w-sm text-sm text-zinc-400'>
											The player stays idle until a user clicks a Public Music card.
										</p>
									</div>
								)}
							</div>
						</div>
					</section>

					<section className='mt-8 rounded-[28px] border border-white/10 bg-black/30 p-4 sm:p-5'>
						<div className='mb-4 flex items-center justify-between gap-3'>
							<div>
								<h2 className='text-xl font-semibold text-white'>Search Results</h2>
								<p className='text-sm text-zinc-400'>Results for "{query}" from YouTube Music.</p>
							</div>
							<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'>
								{results.length} tracks
							</div>
						</div>

						{error ? (
							<div className='rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100'>{error}</div>
						) : isLoading ? (
							<div className='flex min-h-[240px] items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
								<div className='flex items-center gap-3 text-sm text-zinc-300'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading YouTube Music songs...
								</div>
							</div>
						) : results.length === 0 ? (
							<div className='rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400'>
								No songs were returned for this search.
							</div>
						) : (
							<div className='grid gap-3 lg:grid-cols-2'>
								{results.map((song) => {
									const internalSongId = song.internalSongId || resolvedSongs[song.videoId]?._id || null;
									const isActive = activeSong?.videoId === song.videoId && hasStartedPlayback;
									const isFavorite = favoriteVideoIds.has(song.videoId);
									const isQueued = queueVideoIds.has(song.videoId);
									const isNotificationEnabled = internalSongId ? isFollowingSong(internalSongId) : false;

									return (
										<div
											key={song.videoId}
											className={`rounded-2xl border p-3 transition ${
												isActive
													? "border-red-400/40 bg-red-500/10 shadow-[0_12px_40px_rgba(239,68,68,0.12)]"
													: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
											}`}
										>
											<div className='flex items-center gap-4'>
												<button type='button' onClick={() => void handlePlaySong(song)} className='flex min-w-0 flex-1 items-center gap-4 text-left'>
													<div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/10'>
														{song.thumbnailUrl ? (
															<img src={song.thumbnailUrl} alt={song.title} className='h-full w-full object-cover' />
														) : (
															<div className='flex h-full w-full items-center justify-center'>
																<Music4 className='h-7 w-7 text-white/70' />
															</div>
														)}
														<div className='absolute inset-0 flex items-center justify-center bg-black/25'>
															<PlayCircle className='h-8 w-8 text-white' />
														</div>
													</div>

													<div className='min-w-0 flex-1'>
														<p className='truncate font-semibold text-white'>{song.title}</p>
														<p className='truncate text-sm text-zinc-300'>{song.artist}</p>
														<p className='mt-1 truncate text-xs uppercase tracking-[0.18em] text-zinc-500'>
															{song.album ?? "Single"} | {formatDuration(song.duration)}
														</p>
													</div>
												</button>

												<div className='flex flex-col gap-2'>
													<Button
														size='icon'
														variant='ghost'
														className={isFavorite ? "text-red-400 hover:text-red-300" : "text-zinc-400 hover:text-white"}
														onClick={() => void handleFavoriteToggle(song)}
													>
														<Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
													</Button>
													<Button
														size='icon'
														variant='ghost'
														className={isQueued ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-400 hover:text-white"}
														onClick={() => void handleAddToQueue(song)}
													>
														<ListPlus className='h-4 w-4' />
													</Button>
													<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white' onClick={() => void openPlaylistDialog(song)}>
														<Plus className='h-4 w-4' />
													</Button>
													<Button
														size='icon'
														variant='ghost'
														className={isNotificationEnabled ? "text-amber-300 hover:text-amber-200" : "text-zinc-400 hover:text-white"}
														onClick={() => void handleToggleNotification(song)}
													>
														{isNotificationEnabled ? <BellOff className='h-4 w-4' /> : <Bell className='h-4 w-4' />}
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</section>

					<div className='mt-8 grid gap-6 xl:grid-cols-3'>
						<section className='rounded-[24px] border border-white/10 bg-black/30 p-4'>
							<h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400'>Queue</h3>
							<div className='mt-3 space-y-2'>
								{upNextQueue.length === 0 ? (
									<p className='text-sm text-zinc-500'>Queue songs from any Public Music card.</p>
								) : (
									upNextQueue.slice(0, 5).map((song) => (
										<div key={song._id} className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2'>
											<img src={song.imageUrl} alt={song.title} className='h-12 w-12 rounded-lg object-cover' />
											<div className='min-w-0 flex-1'>
												<p className='truncate font-medium text-white'>{song.title}</p>
												<p className='truncate text-xs text-zinc-400'>{song.artist}</p>
											</div>
										</div>
									))
								)}
							</div>
						</section>

						<section className='rounded-[24px] border border-white/10 bg-black/30 p-4'>
							<h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400'>Playlists</h3>
							<div className='mt-3 space-y-2'>
								{playlists.length === 0 ? (
									<p className='text-sm text-zinc-500'>Your existing playlists will appear here after they load.</p>
								) : (
									playlists.slice(0, 5).map((playlist) => (
										<div key={playlist._id} className='rounded-xl border border-white/10 bg-white/5 p-3'>
											<p className='font-medium text-white'>{playlist.name}</p>
											<p className='text-xs text-zinc-400'>{playlist.songs.length} songs</p>
										</div>
									))
								)}
							</div>
						</section>

						<section className='rounded-[24px] border border-white/10 bg-black/30 p-4'>
							<h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400'>History</h3>
							<div className='mt-3 space-y-2'>
								{publicHistory.length === 0 ? (
									<p className='text-sm text-zinc-500'>Played Public Music songs will appear in your history.</p>
								) : (
									publicHistory.slice(0, 5).map((entry) => (
										<button
											type='button'
											key={entry._id}
											onClick={() =>
												void handlePlaySong({
													videoId: entry.song.externalVideoId || "",
													title: entry.song.title,
													artist: entry.song.artist,
													album: null,
													duration: entry.song.duration,
													thumbnailUrl: entry.song.imageUrl,
													internalSongId: entry.song._id,
												})
											}
											className='flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 text-left hover:bg-white/10'
										>
											<img src={entry.song.imageUrl} alt={entry.song.title} className='h-12 w-12 rounded-lg object-cover' />
											<div className='min-w-0 flex-1'>
												<p className='truncate font-medium text-white'>{entry.song.title}</p>
												<p className='truncate text-xs text-zinc-400'>{entry.song.artist}</p>
											</div>
										</button>
									))
								)}
							</div>
						</section>
					</div>
				</div>
			</ScrollArea>

			<Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
				<DialogContent className='border-white/10 bg-zinc-950 text-white'>
					<DialogHeader>
						<DialogTitle>Add to playlist</DialogTitle>
						<DialogDescription className='text-zinc-400'>
							Choose one of your existing playlists using the same playlist API the rest of the app uses.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						<Input
							value={playlistSearch}
							onChange={(event) => setPlaylistSearch(event.target.value)}
							placeholder='Search playlists'
							className='border-white/10 bg-white/5 text-white placeholder:text-zinc-500'
						/>
						<Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
							<SelectTrigger className='border-white/10 bg-white/5 text-white'>
								<SelectValue placeholder='Select a playlist' />
							</SelectTrigger>
							<SelectContent>
								{filteredPlaylists.length > 0 ? (
									filteredPlaylists.map((playlist) => (
										<SelectItem key={playlist._id} value={playlist._id}>
											{playlist.name}
										</SelectItem>
									))
								) : (
									<SelectItem value='no-results' disabled>
										No playlists found
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					<DialogFooter>
						<Button variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10' onClick={() => setIsPlaylistDialogOpen(false)}>
							Cancel
						</Button>
						<Button className='bg-red-500 text-white hover:bg-red-400' onClick={() => void handleSaveToPlaylist()} disabled={!selectedPlaylistId || selectedPlaylistId === "no-results"}>
							Add
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
};

export default PublicMusicPage;
