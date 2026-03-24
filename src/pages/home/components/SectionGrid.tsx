import { Button } from "@/components/ui/button";
import SongActions from "@/components/SongActions";
import { SignedIn } from "@clerk/clerk-react";
import { Song } from "@/types";
import { ArrowUpRight, Disc3 } from "lucide-react";
import { Link } from "react-router-dom";
import PlayButton from "./PlayButton";
import SectionGridSkeleton from "./SectionGridSkeleton";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) {
		return <SectionGridSkeleton />;
	}

	return (
		<div className='mb-10'>
			<div className='mb-5 flex items-center justify-between gap-4'>
				<div>
					<div className='mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-400'>
						<Disc3 className='h-3.5 w-3.5' />
						Curated now
					</div>
					<h2 className='text-2xl font-semibold tracking-tight text-white sm:text-3xl'>{title}</h2>
				</div>
				<Button asChild variant='outline' className='border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white'>
					<Link to='/songs'>
						See All
						<ArrowUpRight className='h-4 w-4' />
					</Link>
				</Button>
			</div>

			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{songs.map((song, index) => (
					<div
						key={song._id}
						className='group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(39,39,42,0.94),rgba(9,9,11,0.98))] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-zinc-900'
					>
						<div className='relative mb-4 overflow-hidden rounded-[22px]'>
							<div
								className='pointer-events-none absolute inset-0 z-10 opacity-80'
								style={{
									background:
										index % 4 === 0
											? "linear-gradient(180deg, transparent 50%, rgba(16,185,129,0.18) 100%)"
											: index % 4 === 1
											? "linear-gradient(180deg, transparent 50%, rgba(59,130,246,0.18) 100%)"
											: index % 4 === 2
											? "linear-gradient(180deg, transparent 50%, rgba(249,115,22,0.18) 100%)"
											: "linear-gradient(180deg, transparent 50%, rgba(244,114,182,0.18) 100%)",
								}}
							/>
							<div className='aspect-square overflow-hidden rounded-[22px] shadow-xl ring-1 ring-white/10'>
								<img
									src={song.imageUrl}
									alt={song.title}
									className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
								/>
							</div>
							<PlayButton song={song} />
							<SignedIn>
								<div className='absolute right-3 top-3 z-20 flex flex-col items-end gap-2'>
									<div className='rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md'>
										<SongActions song={song} showPlaylist={false} showFollow={false} />
									</div>
									<div className='rounded-full border border-white/10 bg-black/40 p-1 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100'>
										<SongActions song={song} showFavorite={false} />
									</div>
								</div>
							</SignedIn>
						</div>

						<div className='space-y-2'>
							<h3 className='truncate text-lg font-semibold text-white'>{song.title}</h3>
							<p className='truncate text-sm text-zinc-400'>{song.artist}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SectionGrid;
