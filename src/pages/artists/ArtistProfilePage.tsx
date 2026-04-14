import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/axios";
import { buildArtistProfileHref, getArtistNameFromProfileParams } from "@/lib/artistProfile";
import { buildSongDetailHref } from "@/lib/songDetail";
import { ensureResolvableSong, filterSongsByArtistName, searchUnifiedSongs } from "@/lib/ytMusic";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { Song } from "@/types";
import { AudioLines, Disc3, Loader2, Music2, Play, SearchCode, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useParams } from "react-router-dom";

const ArtistProfilePage = () => {
	const { artistSlug = "" } = useParams<{ artistSlug: string }>();
	const location = useLocation();
	const artistName = useMemo(
		() => getArtistNameFromProfileParams(artistSlug, new URLSearchParams(location.search)),
		[artistSlug, location.search]
	);
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		const loadArtistSongs = async () => {
			setIsLoading(true);
			setError("");

			try {
				const unifiedSongs = await searchUnifiedSongs(artistName, "", 60);
				if (!isMounted) return;

				const exactSongs = filterSongsByArtistName(unifiedSongs, artistName);
				setSongs(exactSongs.length > 0 ? exactSongs : unifiedSongs);
			} catch {
				if (!isMounted) return;
				setSongs([]);
				setError("Artist songs could not be loaded right now.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadArtistSongs();

		return () => {
			isMounted = false;
		};
	}, [artistName]);

	const primarySong = songs[0] || null;
	const totalDuration = songs.reduce((sum, song) => sum + (song.duration || 0), 0);

	const handlePlaySong = async (song: Song, index: number) => {
		const isCurrentSong =
			currentSong?._id === song._id || (currentSong?.externalVideoId && currentSong.externalVideoId === song.externalVideoId);

		if (isCurrentSong) {
			togglePlay();
			return;
		}

		playAlbum(songs, index);

		try {
			const resolvedSong = await ensureResolvableSong(song);
			await axiosInstance.post(`/songs/${resolvedSong._id}/play`);
		} catch (playError: any) {
			toast.error(playError.response?.data?.message || "Playback started, but the play count could not be saved.");
		}
	};

	return (
		<main className='h-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(180deg,_#07111d,_#030712_52%,_#010101)]'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-96px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
						<div className='grid gap-6 xl:grid-cols-[1.05fr_0.95fr]'>
							<div>
								<div className='inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-sky-200'>
									<Users className='h-3.5 w-3.5' />
									Public Artist Profile
								</div>
								<h1 className='mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl'>{artistName}</h1>
								<p className='mt-4 max-w-2xl text-sm leading-6 text-zinc-300'>
									This public artist page is open to everyone and pulls songs from the same unified library and public music search used elsewhere in the app.
								</p>

								<div className='mt-6 grid gap-3 sm:grid-cols-3'>
									<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
										<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Songs</p>
										<p className='mt-2 text-3xl font-semibold text-white'>{songs.length}</p>
									</div>
									<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
										<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Source</p>
										<p className='mt-2 text-lg font-semibold text-white'>Unified Search</p>
									</div>
									<div className='rounded-2xl border border-white/10 bg-black/20 p-4'>
										<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Duration</p>
										<p className='mt-2 text-lg font-semibold text-white'>
											{Math.floor(totalDuration / 60)} min
										</p>
									</div>
								</div>

								<div className='mt-6 flex flex-wrap gap-3'>
									<Button
										onClick={() => primarySong && void handlePlaySong(primarySong, 0)}
										disabled={!primarySong}
										className='bg-white text-black hover:bg-zinc-200'
									>
										<Play className='mr-2 h-4 w-4 fill-current' />
										Play Top Song
									</Button>
									<Button asChild variant='outline' className='border-white/10 bg-white/5 text-white hover:bg-white/10'>
										<Link to='/artists'>Back to artists</Link>
									</Button>
								</div>
							</div>

							<div className='rounded-[28px] border border-white/10 bg-black/30 p-5'>
								{primarySong ? (
									<div className='flex h-full flex-col'>
										<img src={primarySong.imageUrl} alt={artistName} className='h-64 w-full rounded-[28px] object-cover ring-1 ring-white/10' />
										<div className='mt-5'>
											<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Top discovered song</p>
											<Link to={buildSongDetailHref(primarySong)} state={{ song: primarySong }} className='mt-2 block'>
												<p className='truncate text-2xl font-semibold text-white transition hover:text-emerald-300'>{primarySong.title}</p>
											</Link>
											<p className='mt-2 text-sm text-zinc-400'>{primarySong.albumId || "Single release"}</p>
										</div>
									</div>
								) : (
									<div className='flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center'>
										<SearchCode className='h-10 w-10 text-white/70' />
										<p className='mt-4 text-lg font-medium text-white'>No songs found for this artist.</p>
										<p className='mt-2 max-w-sm text-sm text-zinc-400'>Try opening the artist again from another song or public artist card.</p>
									</div>
								)}
							</div>
						</div>
					</section>

					<section className='mt-8 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5'>
						<div className='mb-4'>
							<h2 className='text-xl font-semibold text-white'>Songs by {artistName}</h2>
							<p className='text-sm text-zinc-400'>Anyone can view this page and open these tracks in the normal song detail flow.</p>
						</div>

						{error ? (
							<div className='rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100'>{error}</div>
						) : isLoading ? (
							<div className='flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
								<div className='flex items-center gap-3 text-sm text-zinc-300'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading artist songs...
								</div>
							</div>
						) : songs.length === 0 ? (
							<div className='rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400'>
								No songs matched this artist name yet.
							</div>
						) : (
							<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
								{songs.map((song, index) => {
									const isCurrentSong =
										currentSong?._id === song._id ||
										(currentSong?.externalVideoId && currentSong.externalVideoId === song.externalVideoId);

									return (
										<div
											key={song.externalVideoId || song._id}
											className='rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(3,7,18,0.98))] p-4 transition hover:border-white/20 hover:bg-black/40'
										>
											<Link to={buildSongDetailHref(song)} state={{ song }} className='block'>
												<img src={song.imageUrl} alt={song.title} className='aspect-square w-full rounded-[22px] object-cover ring-1 ring-white/10' />
											</Link>

											<div className='mt-4 flex items-start justify-between gap-3'>
												<div className='min-w-0 flex-1'>
													<Link to={buildSongDetailHref(song)} state={{ song }} className='block'>
														<h3 className='truncate text-lg font-semibold text-white transition hover:text-emerald-300'>{song.title}</h3>
													</Link>
													<Link to={buildArtistProfileHref(song.artist)} className='mt-1 block truncate text-sm text-zinc-400 transition hover:text-sky-300'>
														{song.artist}
													</Link>
													<p className='mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500'>
														{song.genre || "Public Music"}
													</p>
												</div>
												<Button
													size='icon'
													onClick={() => void handlePlaySong(song, index)}
													className='rounded-full bg-emerald-400 text-black hover:bg-emerald-300'
												>
													{isCurrentSong && isPlaying ? <AudioLines className='h-4 w-4' /> : <Play className='h-4 w-4 fill-current' />}
												</Button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</section>
				</div>
			</ScrollArea>
		</main>
	);
};

export default ArtistProfilePage;
