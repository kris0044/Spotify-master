/* eslint-disable react-hooks/exhaustive-deps */
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecommendationStore } from "@/stores/useRecommendationStore";
import { Sparkles, Search, ArrowUpRight, Disc3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FeaturedSection from "./components/FeaturedSection";
import SectionGrid from "./components/SectionGrid";
import { useAuth } from "@clerk/clerk-react";

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

	useEffect(() => {
		void fetchFeaturedSongs();
		void fetchMadeForYouSongs();
		void fetchTrendingSongs();
		if (isSignedIn) {
			void fetchRecommendations();
		}
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, fetchRecommendations, isSignedIn]);

	useEffect(() => {
		if (madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0) {
			initializeQueue([...featuredSongs, ...madeForYouSongs, ...trendingSongs]);
		}
	}, [initializeQueue, madeForYouSongs, trendingSongs, featuredSongs]);

	const normalizedSearch = searchQuery.trim().toLowerCase();
	const matchesSearch = (value?: string | null) => (value || "").toLowerCase().includes(normalizedSearch);

	const filteredFeatured = useMemo(
		() =>
			featuredSongs.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[featuredSongs, normalizedSearch]
	);

	const filteredMadeForYou = useMemo(
		() =>
			madeForYouSongs.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[madeForYouSongs, normalizedSearch]
	);

	const filteredTrending = useMemo(
		() =>
			trendingSongs.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[trendingSongs, normalizedSearch]
	);

	const filteredRecommendations = useMemo(
		() =>
			recommendations.filter(
				(song) => matchesSearch(song.title) || matchesSearch(song.artist) || matchesSearch(song.albumId)
			),
		[recommendations, normalizedSearch]
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
									Explore featured drops, trending songs, and tailored picks in a cleaner, richer listening space.
								</p>
							</div>

							
						</div>

						<div className='mt-6'>
							<div className='relative max-w-2xl'>
								<Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
								<Input
									placeholder='Search songs, artists, or album ids'
									className='h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-zinc-500'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>
					</section>

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
						{isSignedIn && filteredRecommendations.length > 0 && (
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
