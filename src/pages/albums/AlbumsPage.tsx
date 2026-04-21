import { fetchPublicMusicAlbums } from "@/lib/ytMusic";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { Album as AlbumIcon, Disc3, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const INPUT_DEBOUNCE_MS = 350;

const AlbumsPage = () => {
	const { albums, fetchAlbumsByGenre, isLoading } = useMusicStore();
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
	const [genreQuery, setGenreQuery] = useState(searchParams.get("genre") || "");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchParams.get("search") || "");
	const [debouncedGenreQuery, setDebouncedGenreQuery] = useState(searchParams.get("genre") || "");
	const [publicAlbums, setPublicAlbums] = useState<Album[]>([]);
	const [isPublicLoading, setIsPublicLoading] = useState(false);

	useEffect(() => {
		setSearchQuery(searchParams.get("search") || "");
		setGenreQuery(searchParams.get("genre") || "");
		setDebouncedSearchQuery(searchParams.get("search") || "");
		setDebouncedGenreQuery(searchParams.get("genre") || "");
	}, [searchParams]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
			setDebouncedGenreQuery(genreQuery.trim());
		}, INPUT_DEBOUNCE_MS);

		return () => window.clearTimeout(timeoutId);
	}, [genreQuery, searchQuery]);

	useEffect(() => {
		void fetchAlbumsByGenre(debouncedGenreQuery, debouncedSearchQuery);
	}, [debouncedGenreQuery, debouncedSearchQuery, fetchAlbumsByGenre]);

	useEffect(() => {
		let isMounted = true;

		const loadPublicAlbums = async () => {
			setIsPublicLoading(true);

			try {
				const query = [debouncedGenreQuery, debouncedSearchQuery].filter(Boolean).join(" ").trim();
				const results = await fetchPublicMusicAlbums(query, 8);
				if (!isMounted) return;
				setPublicAlbums(results);
			} catch {
				if (!isMounted) return;
				setPublicAlbums([]);
			} finally {
				if (isMounted) {
					setIsPublicLoading(false);
				}
			}
		};

		void loadPublicAlbums();

		return () => {
			isMounted = false;
		};
	}, [debouncedGenreQuery, debouncedSearchQuery]);

	useEffect(() => {
		const nextParams = new URLSearchParams();
		if (debouncedSearchQuery) nextParams.set("search", debouncedSearchQuery);
		if (debouncedGenreQuery) nextParams.set("genre", debouncedGenreQuery);

		if (nextParams.toString() !== searchParams.toString()) {
			setSearchParams(nextParams, { replace: true });
		}
	}, [debouncedGenreQuery, debouncedSearchQuery, searchParams, setSearchParams]);

	const filteredAlbums = useMemo(() => {
		const merged = [...albums, ...publicAlbums];
		const seen = new Set<string>();
		return merged.filter((album) => {
			if (seen.has(album._id)) return false;
			seen.add(album._id);
			return true;
		});
	}, [albums, publicAlbums]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_30%),linear-gradient(160deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]'>
						<div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
							<div className='max-w-2xl'>
								<div className='mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300'>
									<Disc3 className='h-3.5 w-3.5' />
									Albums
								</div>
								<h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
									Browse the full album collection.
								</h1>
							<p className='mt-3 max-w-xl text-sm leading-6 text-zinc-300'>
								Open any album to see its tracks, cover art, release year, and start listening from the detail page.
							</p>
						</div>
							<div className='grid w-full max-w-2xl gap-3 md:grid-cols-2'>
								<div className='relative'>
									<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
									<Input
										value={searchQuery}
										onChange={(event) => setSearchQuery(event.target.value)}
										placeholder='Search albums, artists, or years'
										className='border-white/10 bg-white/5 pl-10 text-white placeholder:text-zinc-500'
									/>
								</div>
								<Input
									value={genreQuery}
									onChange={(event) => setGenreQuery(event.target.value)}
									placeholder='Filter by genre'
									className='border-white/10 bg-white/5 text-white placeholder:text-zinc-500'
								/>
							</div>
						</div>
					</section>

					<div className='mt-6 flex items-center justify-between'>
						<div>
							<h2 className='text-xl font-semibold text-white'>All Albums</h2>
							<p className='mt-1 text-sm text-zinc-400'>
								{filteredAlbums.length} {filteredAlbums.length === 1 ? "album" : "albums"} available
							</p>
						</div>
					</div>

					{isLoading || isPublicLoading ? (
						<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
							{Array.from({ length: 8 }).map((_, index) => (
								<div key={index} className='animate-pulse rounded-3xl border border-white/10 bg-zinc-900/70 p-4'>
									<div className='aspect-square rounded-2xl bg-zinc-800' />
									<div className='mt-4 h-5 w-2/3 rounded bg-zinc-800' />
									<div className='mt-2 h-4 w-1/2 rounded bg-zinc-800' />
								</div>
							))}
						</div>
					) : filteredAlbums.length === 0 ? (
						<div className='mt-6 rounded-3xl border border-dashed border-white/10 bg-zinc-950/70 px-6 py-16 text-center'>
							<AlbumIcon className='mx-auto h-12 w-12 text-zinc-600' />
							<h3 className='mt-4 text-lg font-semibold text-white'>No albums found</h3>
							<p className='mt-2 text-sm text-zinc-400'>Try a different search to find the album you want.</p>
						</div>
					) : (
						<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
							{filteredAlbums.map((album) => (
								<div
									key={album._id}
									className='group rounded-3xl border border-white/10 bg-zinc-950/85 p-4 transition hover:-translate-y-1 hover:border-white/20 hover:bg-zinc-900'
								>
									<Link to={`/albums/${album._id}`} className='block'>
										<img
											src={album.imageUrl}
											alt={album.title}
											className='aspect-square w-full rounded-2xl object-cover shadow-xl'
										/>
										<div className='mt-4'>
											<h3 className='truncate text-lg font-semibold text-white'>{album.title}</h3>
											<p className='mt-1 truncate text-sm text-zinc-400'>{album.artist}</p>
											<div className='mt-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500'>
												<span>{album.releaseYear}</span>
												<span>{album.trackCount || album.songs?.length || 0} tracks</span>
											</div>
										</div>
									</Link>
									<Button asChild className='mt-4 w-full bg-white text-black hover:bg-zinc-100'>
										<Link to={`/albums/${album._id}`}>Open Album</Link>
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default AlbumsPage;
