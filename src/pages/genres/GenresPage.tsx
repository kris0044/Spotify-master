import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PUBLIC_GENRE_OPTIONS, fetchGenreSongs } from "@/lib/publicGenres";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { Song } from "@/types";
import { AudioLines, Disc3, Loader2, Play, Search, Tags } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const INPUT_DEBOUNCE_MS = 350;

const formatDuration = (duration: number) => {
	const minutes = Math.floor(duration / 60);
	const seconds = duration % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const GenresPage = () => {
	const defaultGenre = PUBLIC_GENRE_OPTIONS[0];
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [selectedGenreId, setSelectedGenreId] = useState(defaultGenre.id);
	const [searchInput, setSearchInput] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [songs, setSongs] = useState<Song[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const activeGenre = useMemo(() => PUBLIC_GENRE_OPTIONS.find((genre) => genre.id === selectedGenreId) || defaultGenre, [selectedGenreId]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, INPUT_DEBOUNCE_MS);

		return () => window.clearTimeout(timeoutId);
	}, [searchQuery]);

	useEffect(() => {
		let isMounted = true;

		const loadGenreData = async () => {
			setIsLoading(true);
			setError("");

			try {
				const songResults = await fetchGenreSongs(activeGenre.query, debouncedSearchQuery, 12);

				if (!isMounted) return;
				setSongs(songResults);
			} catch {
				if (!isMounted) return;
				setSongs([]);
				setError("Genre music could not be loaded from the public API right now.");
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		void loadGenreData();

		return () => {
			isMounted = false;
		};
	}, [activeGenre.query, debouncedSearchQuery]);

	const featuredSong = songs[0] || null;

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearchQuery(searchInput.trim());
	};

	const handlePlaySong = (song: Song, index: number) => {
		const isCurrentSong = currentSong?._id === song._id;
		if (isCurrentSong) {
			togglePlay();
			return;
		}

		playAlbum(songs, index);
	};

	return (
		<main className='h-full overflow-hidden rounded-md bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.14),_transparent_24%),linear-gradient(180deg,_#0f0a05,_#050505_48%,_#000000)]'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-96px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl'>
						<div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
							<div>
								<div className='inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-amber-200'>
									<Tags className='h-3.5 w-3.5' />
									Genres
								</div>
								<h1 className='mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl'>
									Explore songs and albums by genre from a public music API.
								</h1>
								<p className='mt-4 max-w-2xl text-sm leading-6 text-zinc-300'>
									Pick a genre, narrow it with a search, then preview tracks filtered by that genre.
								</p>

								<form className='mt-6 flex flex-col gap-3 md:flex-row' onSubmit={handleSearchSubmit}>
									<div className='relative flex-1'>
										<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
										<Input
											value={searchInput}
											onChange={(event) => setSearchInput(event.target.value)}
											placeholder='Search inside this genre by artist, song, or album'
											className='h-12 border-white/10 bg-black/30 pl-11 text-white placeholder:text-zinc-500'
										/>
									</div>
									<Button type='submit' className='h-12 bg-amber-400 px-6 text-black hover:bg-amber-300'>
										<Search className='mr-2 h-4 w-4' />
										Filter
									</Button>
								</form>

								<div className='mt-5 flex flex-wrap gap-2'>
									{PUBLIC_GENRE_OPTIONS.map((genre) => (
										<button
											key={genre.id}
											type='button'
											onClick={() => setSelectedGenreId(genre.id)}
											className={cn(
												"rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
												selectedGenreId === genre.id
													? "border-amber-300 bg-amber-300 text-black"
													: "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
											)}
										>
											{genre.label}
										</button>
									))}
								</div>
							</div>

							<div className={cn("rounded-[28px] border border-white/10 bg-black/35 p-5", `bg-gradient-to-br ${activeGenre.accent}`)}>
								{featuredSong ? (
									<div className='flex h-full flex-col'>
										<div className='flex items-center gap-4'>
											<img src={featuredSong.imageUrl} alt={featuredSong.title} className='h-24 w-24 rounded-[28px] object-cover ring-1 ring-white/10' />
											<div className='min-w-0'>
												<p className='text-xs uppercase tracking-[0.24em] text-zinc-400'>Featured preview</p>
												<h2 className='truncate text-2xl font-semibold text-white'>{featuredSong.title}</h2>
												<p className='mt-2 truncate text-sm text-zinc-300'>{featuredSong.artist}</p>
												<p className='mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500'>
													{featuredSong.genre || activeGenre.label} | {formatDuration(featuredSong.duration)}
												</p>
											</div>
										</div>

										<div className='mt-5 grid gap-3 sm:grid-cols-3'>
											<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
												<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Genre</p>
												<p className='mt-2 text-xl font-semibold text-white'>{activeGenre.label}</p>
											</div>
										<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
											<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Songs</p>
											<p className='mt-2 text-3xl font-semibold text-white'>{songs.length}</p>
										</div>
										<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
											<p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Filter</p>
											<p className='mt-2 text-lg font-semibold text-white'>{searchQuery || "Genre only"}</p>
										</div>
									</div>

										<Button
											type='button'
											onClick={() => handlePlaySong(featuredSong, 0)}
											className='mt-5 w-fit bg-white text-black hover:bg-amber-100'
										>
											{currentSong?._id === featuredSong._id && isPlaying ? (
												<AudioLines className='mr-2 h-4 w-4' />
											) : (
												<Play className='mr-2 h-4 w-4 fill-current' />
											)}
											Play Preview
										</Button>
									</div>
								) : (
									<div className='flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 text-center'>
										<Disc3 className='h-10 w-10 text-white/70' />
										<p className='mt-4 text-lg font-medium text-white'>No preview tracks found.</p>
										<p className='mt-2 max-w-sm text-sm text-zinc-400'>Try another genre or a broader search term.</p>
									</div>
								)}
							</div>
						</div>
					</section>

					{error ? (
						<div className='mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100'>{error}</div>
					) : null}

					<section className='mt-8 rounded-[28px] border border-white/10 bg-black/25 p-4 sm:p-5'>
						<div className='mb-4 flex items-center justify-between gap-3'>
							<div>
								<h2 className='text-xl font-semibold text-white'>Genre Songs</h2>
								<p className='text-sm text-zinc-400'>
									{searchQuery ? `Results for "${searchQuery}" inside ${activeGenre.label}.` : `Preview-ready songs for ${activeGenre.label}.`}
								</p>
							</div>
						</div>

						{isLoading ? (
							<div className='flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
								<div className='flex items-center gap-3 text-sm text-zinc-300'>
									<Loader2 className='h-4 w-4 animate-spin' />
									Loading genre songs...
								</div>
							</div>
						) : songs.length === 0 ? (
							<div className='rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-zinc-400'>
								No songs matched this genre filter.
							</div>
						) : (
							<div className='grid gap-3 lg:grid-cols-2'>
								{songs.map((song, index) => {
									const isCurrentSong = currentSong?._id === song._id;

									return (
										<div
											key={song._id}
											className={cn(
												"rounded-2xl border p-3 transition",
												isCurrentSong ? "border-amber-300/40 bg-amber-400/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
											)}
										>
											<div className='flex items-center gap-3'>
												<img src={song.imageUrl} alt={song.title} className='h-16 w-16 rounded-xl object-cover' />
												<div className='min-w-0 flex-1'>
													<p className='truncate font-semibold text-white'>{song.title}</p>
													<p className='truncate text-sm text-zinc-300'>{song.artist}</p>
													<p className='mt-1 truncate text-xs uppercase tracking-[0.18em] text-zinc-500'>
														{song.albumId || "Single"} | {formatDuration(song.duration)}
													</p>
												</div>
												<Button
													type='button'
													onClick={() => handlePlaySong(song, index)}
													className='bg-white text-black hover:bg-amber-100'
												>
													{isCurrentSong && isPlaying ? (
														<AudioLines className='mr-2 h-4 w-4' />
													) : (
														<Play className='mr-2 h-4 w-4 fill-current' />
													)}
													Play
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

export default GenresPage;
