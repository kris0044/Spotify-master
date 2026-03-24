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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchPublicMusicCharts } from "@/lib/ytMusic";
import type { PublicMusicChartResponse, PublicMusicSong } from "@/types";
import {
	Globe2,
	Heart,
	LibraryBig,
	ListMusic,
	Loader2,
	Music4,
	PlayCircle,
	Plus,
	Radio,
	SkipBack,
	SkipForward,
	Star,
	Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const REGION_OPTIONS = ["India", "United States", "United Kingdom", "Canada", "Japan", "Germany", "Brazil", "Pakistan"];

const FAVORITES_KEY = "public_music_top100_favorites_v1";
const QUEUE_KEY = "public_music_top100_queue_v1";
const PLAYLISTS_KEY = "public_music_top100_playlists_v1";

interface LocalPlaylist {
	id: string;
	name: string;
	songs: PublicMusicSong[];
}

const formatDuration = (duration: number | null) => {
	if (!duration) return "Unknown";

	const minutes = Math.floor(duration / 60);
	const seconds = duration % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const readStorage = <T,>(key: string, fallback: T): T => {
	if (typeof window === "undefined") return fallback;

	try {
		const value = window.localStorage.getItem(key);
		return value ? (JSON.parse(value) as T) : fallback;
	} catch {
		return fallback;
	}
};

const writeStorage = (key: string, value: unknown) => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify(value));
};

const songExists = (songs: PublicMusicSong[], target: PublicMusicSong) => songs.some((song) => song.videoId === target.videoId);

const PublicMusicTop100Page = () => {
	const [scope, setScope] = useState<"global" | "region">("global");
	const [region, setRegion] = useState("India");
	const [chart, setChart] = useState<PublicMusicChartResponse | null>(null);
	const [activeSong, setActiveSong] = useState<PublicMusicSong | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [favorites, setFavorites] = useState<PublicMusicSong[]>([]);
	const [queue, setQueue] = useState<PublicMusicSong[]>([]);
	const [playlists, setPlaylists] = useState<LocalPlaylist[]>([]);
	const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
	const [selectedSong, setSelectedSong] = useState<PublicMusicSong | null>(null);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
	const [newPlaylistName, setNewPlaylistName] = useState("");
	const [isStorageReady, setIsStorageReady] = useState(false);

	useEffect(() => {
		setFavorites(readStorage(FAVORITES_KEY, []));
		setQueue(readStorage(QUEUE_KEY, []));
		setPlaylists(readStorage(PLAYLISTS_KEY, []));
		setIsStorageReady(true);
	}, []);

	useEffect(() => {
		if (!isStorageReady) return;
		writeStorage(FAVORITES_KEY, favorites);
	}, [favorites, isStorageReady]);

	useEffect(() => {
		if (!isStorageReady) return;
		writeStorage(QUEUE_KEY, queue);
	}, [queue, isStorageReady]);

	useEffect(() => {
		if (!isStorageReady) return;
		writeStorage(PLAYLISTS_KEY, playlists);
	}, [playlists, isStorageReady]);

	useEffect(() => {
		let isMounted = true;

		const loadChart = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetchPublicMusicCharts(scope, scope === "region" ? region : undefined);
				if (!isMounted) return;

				setChart(response);
				setActiveSong(response.songs[0] ?? null);
			} catch {
				if (!isMounted) return;
				setError("Top 100 songs could not be loaded right now from the server.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadChart();

		return () => {
			isMounted = false;
		};
	}, [scope, region]);

	const favoriteIds = useMemo(() => new Set(favorites.map((song) => song.videoId)), [favorites]);
	const queueIds = useMemo(() => new Set(queue.map((song) => song.videoId)), [queue]);

	const handleToggleFavorite = (song: PublicMusicSong) => {
		setFavorites((currentFavorites) =>
			songExists(currentFavorites, song)
				? currentFavorites.filter((item) => item.videoId !== song.videoId)
				: [song, ...currentFavorites]
		);
	};

	const handleAddToQueue = (song: PublicMusicSong) => {
		setQueue((currentQueue) => (songExists(currentQueue, song) ? currentQueue : [...currentQueue, song]));
	};

	const handlePlayFromQueue = (direction: "next" | "previous") => {
		if (queue.length === 0 || !activeSong) return;

		const currentIndex = queue.findIndex((song) => song.videoId === activeSong.videoId);

		if (direction === "next") {
			const nextSong = queue[currentIndex + 1] ?? queue[0];
			setActiveSong(nextSong);
			return;
		}

		const previousSong = queue[currentIndex - 1] ?? queue[queue.length - 1];
		setActiveSong(previousSong);
	};

	const openPlaylistDialog = (song: PublicMusicSong) => {
		setSelectedSong(song);
		setSelectedPlaylistId("");
		setNewPlaylistName("");
		setIsPlaylistDialogOpen(true);
	};

	const handleSaveToPlaylist = () => {
		if (!selectedSong) return;

		let targetPlaylistId = selectedPlaylistId;

		setPlaylists((currentPlaylists) => {
			let nextPlaylists = [...currentPlaylists];

			if (!targetPlaylistId && newPlaylistName.trim()) {
				targetPlaylistId = `playlist-${Date.now()}`;
				nextPlaylists = [
					{
						id: targetPlaylistId,
						name: newPlaylistName.trim(),
						songs: [],
					},
					...nextPlaylists,
				];
			}

			if (!targetPlaylistId) {
				return nextPlaylists;
			}

			return nextPlaylists.map((playlist) =>
				playlist.id === targetPlaylistId && !songExists(playlist.songs, selectedSong)
					? { ...playlist, songs: [...playlist.songs, selectedSong] }
					: playlist
			);
		});

		setIsPlaylistDialogOpen(false);
	};

	return (
		<main className='h-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.16),_transparent_22%),linear-gradient(180deg,_#071018,_#030303_52%,_#000000)]'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-96px)]'>
				<div className='p-4 sm:p-6'>
					<section className='rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
						<div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
							<div>
								<div className='inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-200'>
									<Trophy className='h-3.5 w-3.5' />
									Top 100
								</div>
								<h1 className='mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl'>
									Global and regional YouTube Music charts.
								</h1>
								<p className='mt-3 max-w-3xl text-sm leading-6 text-zinc-300'>
									The player stays fixed on this page while the chart list scrolls below it. Favorites, playlists, and queue are saved locally for these YouTube chart songs.
								</p>
							</div>

							<div className='flex flex-col gap-3 md:flex-row'>
								<Tabs value={scope} onValueChange={(value) => setScope(value as "global" | "region")}>
									<TabsList className='bg-black/30'>
										<TabsTrigger value='global' className='gap-2 data-[state=active]:bg-white data-[state=active]:text-black'>
											<Globe2 className='h-4 w-4' />
											Global
										</TabsTrigger>
										<TabsTrigger value='region' className='gap-2 data-[state=active]:bg-white data-[state=active]:text-black'>
											<Radio className='h-4 w-4' />
											Region
										</TabsTrigger>
									</TabsList>
								</Tabs>

								{scope === "region" && (
									<Select value={region} onValueChange={setRegion}>
										<SelectTrigger className='h-10 w-[220px] border-white/10 bg-black/30 text-white'>
											<SelectValue placeholder='Select region' />
										</SelectTrigger>
										<SelectContent>
											{REGION_OPTIONS.map((option) => (
												<SelectItem key={option} value={option}>
													{option}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						</div>
					</section>

					<div className='mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'>
						<section className='min-w-0'>
							{error ? (
								<div className='rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100'>{error}</div>
							) : isLoading ? (
								<div className='flex min-h-[360px] items-center justify-center rounded-[28px] border border-white/10 bg-white/5'>
									<div className='flex items-center gap-3 text-sm text-zinc-300'>
										<Loader2 className='h-4 w-4 animate-spin' />
										Loading top chart songs...
									</div>
								</div>
							) : (
								<div className='rounded-[28px] border border-white/10 bg-black/30 p-4 sm:p-5'>
									<div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
										<div>
											<h2 className='text-xl font-semibold text-white'>
												{scope === "global" ? "Global Top 100" : `${region} Top 100`}
											</h2>
											<p className='text-sm text-zinc-400'>
												{chart?.playlist.name} {chart?.sourceQuery ? `| via ${chart.sourceQuery}` : ""}
											</p>
										</div>
										<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'>
											{chart?.songs.length ?? 0} tracks
										</div>
									</div>

									<div className='space-y-3'>
										{chart?.songs.map((song) => {
											const isActive = activeSong?.videoId === song.videoId;
											const isFavorite = favoriteIds.has(song.videoId);
											const isQueued = queueIds.has(song.videoId);

											return (
												<div
													key={song.videoId}
													className={`rounded-2xl border p-3 transition ${
														isActive
															? "border-sky-400/40 bg-sky-500/10 shadow-[0_12px_40px_rgba(14,165,233,0.12)]"
															: "border-white/10 bg-white/5 hover:bg-white/10"
													}`}
												>
													<div className='flex gap-4'>
														<button type='button' className='flex min-w-0 flex-1 items-center gap-4 text-left' onClick={() => setActiveSong(song)}>
															<div className='flex w-10 flex-shrink-0 items-center justify-center text-lg font-semibold text-zinc-400'>
																{song.rank ?? "-"}
															</div>
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
																onClick={() => handleToggleFavorite(song)}
															>
																<Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
															</Button>
															<Button
																size='icon'
																variant='ghost'
																className={isQueued ? "text-emerald-400 hover:text-emerald-300" : "text-zinc-400 hover:text-white"}
																onClick={() => handleAddToQueue(song)}
															>
																<ListMusic className='h-4 w-4' />
															</Button>
															<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white' onClick={() => openPlaylistDialog(song)}>
																<Plus className='h-4 w-4' />
															</Button>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</section>

						<aside className='xl:sticky xl:top-6 xl:self-start'>
							<div className='rounded-[28px] border border-white/10 bg-black/40 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl'>
								{activeSong ? (
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

										<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
											<p className='text-xs uppercase tracking-[0.22em] text-sky-300'>Now playing</p>
											<p className='mt-2 truncate text-xl font-semibold text-white'>{activeSong.title}</p>
											<p className='truncate text-sm text-zinc-300'>{activeSong.artist}</p>
											<p className='mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500'>
												{activeSong.album ?? "YouTube Music"} | {formatDuration(activeSong.duration)}
											</p>

											<div className='mt-4 flex gap-2'>
												<Button size='icon' variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10' onClick={() => handlePlayFromQueue("previous")}>
													<SkipBack className='h-4 w-4' />
												</Button>
												<Button size='icon' variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10' onClick={() => handlePlayFromQueue("next")}>
													<SkipForward className='h-4 w-4' />
												</Button>
												<Button variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10' onClick={() => handleToggleFavorite(activeSong)}>
													<Heart className={`mr-2 h-4 w-4 ${favoriteIds.has(activeSong.videoId) ? "fill-current text-red-400" : ""}`} />
													Favorite
												</Button>
											</div>
										</div>

										<div className='grid gap-4 md:grid-cols-3 xl:grid-cols-1'>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<div className='flex items-center gap-2 text-white'>
													<Star className='h-4 w-4 text-red-300' />
													Favorites
												</div>
												<p className='mt-2 text-2xl font-semibold text-white'>{favorites.length}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<div className='flex items-center gap-2 text-white'>
													<ListMusic className='h-4 w-4 text-emerald-300' />
													Queue
												</div>
												<p className='mt-2 text-2xl font-semibold text-white'>{queue.length}</p>
											</div>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<div className='flex items-center gap-2 text-white'>
													<LibraryBig className='h-4 w-4 text-sky-300' />
													Playlists
												</div>
												<p className='mt-2 text-2xl font-semibold text-white'>{playlists.length}</p>
											</div>
										</div>

										<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
											<h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400'>Queue</h3>
											<div className='mt-3 max-h-52 space-y-2 overflow-y-auto pr-1'>
												{queue.length === 0 ? (
													<p className='text-sm text-zinc-500'>Add chart songs to queue from the list.</p>
												) : (
													queue.map((song) => (
														<button
															type='button'
															key={song.videoId}
															onClick={() => setActiveSong(song)}
															className='flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2 text-left hover:bg-white/10'
														>
															<img src={song.thumbnailUrl} alt={song.title} className='h-12 w-12 rounded-lg object-cover' />
															<div className='min-w-0 flex-1'>
																<p className='truncate font-medium text-white'>{song.title}</p>
																<p className='truncate text-xs text-zinc-400'>{song.artist}</p>
															</div>
														</button>
													))
												)}
											</div>
										</div>

										<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
											<h3 className='text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400'>Local playlists</h3>
											<div className='mt-3 max-h-52 space-y-2 overflow-y-auto pr-1'>
												{playlists.length === 0 ? (
													<p className='text-sm text-zinc-500'>Create a playlist from any chart track.</p>
												) : (
													playlists.map((playlist) => (
														<div key={playlist.id} className='rounded-xl border border-white/10 bg-black/20 p-3'>
															<p className='font-medium text-white'>{playlist.name}</p>
															<p className='text-xs text-zinc-400'>{playlist.songs.length} songs</p>
														</div>
													))
												)}
											</div>
										</div>
									</div>
								) : (
									<div className='flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 text-center'>
										<Radio className='h-10 w-10 text-white/70' />
										<p className='mt-4 text-lg font-medium text-white'>Choose a chart song to begin.</p>
									</div>
								)}
							</div>
						</aside>
					</div>
				</div>
			</ScrollArea>

			<Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
				<DialogContent className='border-white/10 bg-zinc-950 text-white'>
					<DialogHeader>
						<DialogTitle>Save chart song to playlist</DialogTitle>
						<DialogDescription className='text-zinc-400'>
							Add this YouTube chart track to an existing local playlist or create a new one.
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						<Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
							<SelectTrigger className='border-white/10 bg-white/5 text-white'>
								<SelectValue placeholder='Choose an existing playlist' />
							</SelectTrigger>
							<SelectContent>
								{playlists.map((playlist) => (
									<SelectItem key={playlist.id} value={playlist.id}>
										{playlist.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className='space-y-2'>
							<p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Or create a new playlist</p>
							<Input
								value={newPlaylistName}
								onChange={(event) => setNewPlaylistName(event.target.value)}
								placeholder='New playlist name'
								className='border-white/10 bg-white/5 text-white placeholder:text-zinc-500'
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10' onClick={() => setIsPlaylistDialogOpen(false)}>
							Cancel
						</Button>
						<Button className='bg-sky-500 text-white hover:bg-sky-400' onClick={handleSaveToPlaylist} disabled={!selectedPlaylistId && !newPlaylistName.trim()}>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
};

export default PublicMusicTop100Page;
