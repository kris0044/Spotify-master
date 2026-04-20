import { axiosInstance } from "@/lib/axios";
import { fetchPublicAlbumById, isPublicAlbumId } from "@/lib/publicGenres";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Album } from "@/types";
import { ArrowLeft, Clock, Disc3, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadAlbum = async () => {
			if (!albumId) {
				setCurrentAlbum(null);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);

			try {
				if (isPublicAlbumId(albumId)) {
					const album = await fetchPublicAlbumById(albumId);
					if (!isMounted) return;
					setCurrentAlbum(album);
				} else {
					const response = await axiosInstance.get(`/albums/${albumId}`);
					if (!isMounted) return;
					setCurrentAlbum(response.data);
				}
			} catch {
				if (!isMounted) return;
				setCurrentAlbum(null);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadAlbum();

		return () => {
			isMounted = false;
		};
	}, [albumId]);

	const handlePlayAlbum = () => {
		if (!currentAlbum || currentAlbum.songs.length === 0) {
			return;
		}

		const isCurrentAlbumPlaying = currentAlbum.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) {
			togglePlay();
			return;
		}

		playAlbum(currentAlbum.songs, 0);
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) {
			return;
		}

		playAlbum(currentAlbum.songs, index);
	};

	if (isLoading) {
		return (
			<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 to-black'>
				<Topbar />
				<div className='flex h-[calc(100vh-180px)] items-center justify-center text-zinc-400'>Loading album...</div>
			</main>
		);
	}

	if (!currentAlbum) {
		return (
			<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 to-black'>
				<Topbar />
				<div className='flex h-[calc(100vh-180px)] flex-col items-center justify-center px-6 text-center'>
					<Disc3 className='h-12 w-12 text-zinc-600' />
					<h1 className='mt-4 text-2xl font-semibold text-white'>Album not found</h1>
					<p className='mt-2 text-sm text-zinc-400'>This album may be unavailable or not approved for users.</p>
					<Button asChild className='mt-6 bg-white text-black hover:bg-zinc-100'>
						<Link to='/albums'>Back to Albums</Link>
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)] rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='absolute inset-0 bg-gradient-to-b from-emerald-700/30 via-zinc-900/80 to-zinc-950 pointer-events-none'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='px-6 pt-6'>
							<Button asChild variant='ghost' className='text-zinc-300 hover:text-white'>
								<Link to='/albums'>
									<ArrowLeft className='mr-2 h-4 w-4' />
									Back to Albums
								</Link>
							</Button>
						</div>

						<div className='flex flex-col gap-6 p-4 pb-8 sm:p-6 lg:flex-row'>
							<img
								src={currentAlbum.imageUrl}
								alt={currentAlbum.title}
								className='h-[220px] w-[220px] self-center rounded-2xl object-cover shadow-2xl sm:h-[240px] sm:w-[240px] lg:self-auto'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium uppercase tracking-[0.24em] text-zinc-300'>Album</p>
								<h1 className='my-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl'>{currentAlbum.title}</h1>
								<div className='flex flex-wrap items-center gap-2 text-sm text-zinc-200'>
									<span className='font-medium text-white'>{currentAlbum.artist}</span>
									<span>• {currentAlbum.songs.length} songs</span>
									<span>• {currentAlbum.releaseYear}</span>
								</div>
							</div>
						</div>

						<div className='flex items-center gap-6 px-6 pb-4'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								disabled={currentAlbum.songs.length === 0}
								className='h-14 w-14 rounded-full bg-green-500 text-black hover:scale-105 hover:bg-green-400 transition-all disabled:opacity-50'
							>
								{isPlaying && currentAlbum.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7' />
								) : (
									<Play className='h-7 w-7' />
								)}
							</Button>
						</div>

						<div className='bg-black/20 backdrop-blur-sm'>
							<div className='hidden grid-cols-[16px_4fr_2fr_1fr] gap-4 border-b border-white/5 px-10 py-3 text-sm text-zinc-400 md:grid'>
								<div>#</div>
								<div>Title</div>
								<div>Released Date</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
							</div>

							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{currentAlbum.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;

										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className='group cursor-pointer rounded-md px-3 py-3 text-sm text-zinc-400 hover:bg-white/5 md:grid md:grid-cols-[16px_4fr_2fr_1fr] md:gap-4 md:px-4 md:py-2'
											>
												<div className='flex items-center justify-center'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-green-500'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && <Play className='hidden h-4 w-4 group-hover:block' />}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
													<div>
														<div className='font-medium text-white'>{song.title}</div>
														<div>{song.artist}</div>
													</div>
												</div>
												<div className='mt-2 flex items-center justify-between text-xs text-zinc-500 md:mt-0 md:text-sm md:text-zinc-400'>
													<span className='md:hidden'>Released</span>
													<span>{song.createdAt.split("T")[0]}</span>
												</div>
												<div className='flex items-center justify-between text-xs text-zinc-500 md:text-sm md:text-zinc-400'>
													<span className='md:hidden'>Duration</span>
													<span>{formatDuration(song.duration)}</span>
												</div>
											</div>
										);
									})}

									{currentAlbum.songs.length === 0 && (
										<div className='rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500'>
											No songs available in this album yet.
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};

export default AlbumPage;
