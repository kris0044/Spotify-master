import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import { Song } from "@/types";
import { useMusicStore } from "@/stores/useMusicStore";
import PlayButton from "./PlayButton";

interface FeaturedSectionProps {
	songs?: Song[];
}

const FeaturedSection = ({ songs }: FeaturedSectionProps) => {
	const { isLoading, error, featuredSongs } = useMusicStore();
	const displaySongs = songs ?? featuredSongs;

	if (isLoading) {
		return <FeaturedGridSkeleton />;
	}

	if (error) {
		return <p className='mb-4 text-lg text-red-500'>{error}</p>;
	}

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
			{displaySongs.map((song, index) => (
				<div
					key={song._id}
					className='group relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(39,39,42,0.96),rgba(9,9,11,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-white/20'
				>
					<div
						className='absolute inset-0 opacity-70'
						style={{
							background:
								index % 3 === 0
									? "radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 35%)"
									: index % 3 === 1
									? "radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 35%)"
									: "radial-gradient(circle at top right, rgba(249,115,22,0.18), transparent 35%)",
						}}
					/>
					<div className='relative flex items-center gap-4 p-4'>
						<img
							src={song.imageUrl}
							alt={song.title}
							className='h-20 w-20 rounded-2xl object-cover shadow-xl ring-1 ring-white/10'
						/>
						<div className='min-w-0 flex-1 pr-12'>
							<div className='mb-2 text-[11px] uppercase tracking-[0.24em] text-zinc-500'>Featured pick</div>
							<p className='truncate text-lg font-semibold text-white'>{song.title}</p>
							<p className='mt-1 truncate text-sm text-zinc-400'>{song.artist}</p>
						</div>
						<PlayButton song={song} />
					</div>
				</div>
			))}
		</div>
	);
};

export default FeaturedSection;
