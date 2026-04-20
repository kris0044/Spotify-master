import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchUnifiedSongs } from "@/lib/ytMusic";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { AudioLines, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import SectionGrid from "../home/components/SectionGrid";

const INPUT_DEBOUNCE_MS = 350;

const AllSongsPage = () => {
	const { fetchAllSongs, allSongs, isLoading, hasMoreSongs } = useMusicStore();
	const [offset, setOffset] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [genreQuery, setGenreQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [debouncedGenreQuery, setDebouncedGenreQuery] = useState("");
	const [mixedResults, setMixedResults] = useState<Song[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const limit = 10;

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
			setDebouncedGenreQuery(genreQuery.trim());
		}, INPUT_DEBOUNCE_MS);

		return () => window.clearTimeout(timeoutId);
	}, [genreQuery, searchQuery]);

	useEffect(() => {
		if (debouncedSearchQuery) {
			return;
		}
		void fetchAllSongs(limit, offset, debouncedSearchQuery, debouncedGenreQuery);
	}, [debouncedGenreQuery, debouncedSearchQuery, fetchAllSongs, offset]);

	useEffect(() => {
		let isMounted = true;

		const loadMixedResults = async () => {
			const trimmedQuery = debouncedSearchQuery;
			if (!trimmedQuery) {
				setMixedResults([]);
				setIsSearching(false);
				return;
			}

			setIsSearching(true);

			try {
				const results = await searchUnifiedSongs(trimmedQuery, debouncedGenreQuery, 18);
				if (!isMounted) return;
				setMixedResults(results);
			} catch {
				if (!isMounted) return;
				setMixedResults([]);
			} finally {
				if (isMounted) {
					setIsSearching(false);
				}
			}
		};

		void loadMixedResults();

		return () => {
			isMounted = false;
		};
	}, [debouncedGenreQuery, debouncedSearchQuery]);

	const handleLoadMore = () => {
		if (!isLoading && hasMoreSongs) {
			setOffset((prev) => prev + limit);
		}
	};

	const handleSearchChange = (value: string) => {
		setOffset(0);
		setSearchQuery(value);
	};

	const handleGenreChange = (value: string) => {
		setOffset(0);
		setGenreQuery(value);
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-950 via-black to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<section className='overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(155deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]'>
						<div className='max-w-2xl'>
							<div className='mb-3 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-sky-300'>
								<AudioLines className='h-3.5 w-3.5' />
								Song Library
							</div>
							<h1 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>Browse every song in one place.</h1>
							<p className='mt-3 text-sm leading-6 text-zinc-300'>
								Search tracks and artists, then keep scrolling to explore the full catalog without changing the listening flow.
							</p>
						</div>

						<div className='mt-6 grid max-w-4xl gap-3 md:grid-cols-2'>
							<div className='relative'>
								<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
								<Input
									placeholder='Search songs, artists, albums'
									className='h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500'
									value={searchQuery}
									onChange={(e) => handleSearchChange(e.target.value)}
								/>
							</div>
							<Input
								placeholder='Filter by genre'
								className='h-12 border-white/10 bg-white/5 text-white placeholder:text-zinc-500'
								value={genreQuery}
								onChange={(e) => handleGenreChange(e.target.value)}
							/>
						</div>
					</section>

					<div className='mt-8'>
						<SectionGrid
							title={searchQuery.trim() ? 'Search Results' : 'All Songs'}
							songs={searchQuery.trim() ? mixedResults : allSongs}
							isLoading={searchQuery.trim() ? isSearching : isLoading && offset === 0}
						/>
					</div>

					{!searchQuery.trim() && hasMoreSongs && (
						<div className='mt-6 flex justify-center'>
							<Button
								onClick={handleLoadMore}
								disabled={isLoading}
								variant='outline'
								className='border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10'
							>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Loading...
									</>
								) : (
									"Load More"
								)}
							</Button>
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default AllSongsPage;
