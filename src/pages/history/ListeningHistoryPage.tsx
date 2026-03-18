import HistoryListSkeleton from "@/components/skeletons/HistoryListSkeleton";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useChatStore } from "@/stores/useChatStore";
import { Clock3, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";

const formatDate = (date: string | null) => {
	if (!date) return "Never";
	return new Date(date).toLocaleString();
};

const ListeningHistoryPage = () => {
	const { fetchListeningHistory, recentlyPlayed, topPlayedSongs, stats, isLoading } = useHistoryStore();
	const { playAlbum } = usePlayerStore();
	const { socket } = useChatStore();

	useEffect(() => {
		fetchListeningHistory();
	}, [fetchListeningHistory]);

	useEffect(() => {
		const onHistoryUpdated = () => {
			fetchListeningHistory();
		};

		socket.on("history_updated", onHistoryUpdated);
		return () => {
			socket.off("history_updated", onHistoryUpdated);
		};
	}, [fetchListeningHistory, socket]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6 space-y-6'>
					<section className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
						<div className='rounded-md bg-zinc-900/80 p-4'>
							<p className='text-xs text-zinc-400 mb-1'>Total Plays</p>
							<p className='text-2xl font-semibold'>{stats.totalPlays}</p>
						</div>
						<div className='rounded-md bg-zinc-900/80 p-4'>
							<p className='text-xs text-zinc-400 mb-1'>Unique Songs</p>
							<p className='text-2xl font-semibold'>{stats.uniqueSongs}</p>
						</div>
						<div className='rounded-md bg-zinc-900/80 p-4'>
							<p className='text-xs text-zinc-400 mb-1'>Last Played</p>
							<p className='text-sm sm:text-base font-medium'>{formatDate(stats.lastPlayedAt)}</p>
						</div>
					</section>

					<section>
						<div className='flex items-center justify-between mb-3'>
							<h1 className='text-2xl font-bold flex items-center gap-2'>
								<Clock3 className='size-6 text-emerald-400' />
								Recently Played
							</h1>
							<Button variant='outline' onClick={fetchListeningHistory}>
								<RotateCcw className='size-4 mr-2' />
								Refresh
							</Button>
						</div>

						{isLoading ? (
							<HistoryListSkeleton />
						) : recentlyPlayed.length === 0 ? (
							<div className='text-zinc-400 rounded-md border border-zinc-800 bg-zinc-900/60 p-6'>
								No listening history yet. Start playing songs to build your history.
							</div>
						) : (
							<div className='space-y-2'>
								{recentlyPlayed.map((entry) => (
									<div
										key={entry._id}
										className='flex items-center gap-3 rounded-md bg-zinc-900/70 hover:bg-zinc-800/70 p-2 sm:p-3'
									>
										<img
											src={entry.song.imageUrl}
											alt={entry.song.title}
											className='size-12 rounded object-cover shrink-0'
										/>
										<div className='min-w-0 flex-1'>
											<p className='font-medium truncate'>{entry.song.title}</p>
											<p className='text-sm text-zinc-400 truncate'>
												{entry.song.artist} - Played {entry.playCount} {entry.playCount === 1 ? "time" : "times"}
											</p>
										</div>
										<Button size='sm' onClick={() => playAlbum([entry.song], 0)}>
											<Play className='size-4 mr-2' />
											Play
										</Button>
									</div>
								))}
							</div>
						)}
					</section>

					<section>
						<h2 className='text-xl font-semibold mb-3'>Most Played Songs</h2>
						{isLoading ? (
							<HistoryListSkeleton />
						) : topPlayedSongs.length === 0 ? (
							<div className='text-zinc-400 rounded-md border border-zinc-800 bg-zinc-900/60 p-6'>
								No top songs yet.
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								{topPlayedSongs.map((entry) => (
									<div
										key={`top-${entry._id}`}
										className='flex items-center gap-3 rounded-md bg-zinc-900/70 hover:bg-zinc-800/70 p-2 sm:p-3'
									>
										<img
											src={entry.song.imageUrl}
											alt={entry.song.title}
											className='size-12 rounded object-cover shrink-0'
										/>
										<div className='min-w-0 flex-1'>
											<p className='font-medium truncate'>{entry.song.title}</p>
											<p className='text-sm text-zinc-400 truncate'>
												{entry.song.artist} - {entry.playCount} {entry.playCount === 1 ? "play" : "plays"}
											</p>
										</div>
										<Button size='icon' onClick={() => playAlbum([entry.song], 0)}>
											<Play className='size-4' />
										</Button>
									</div>
								))}
							</div>
						)}
					</section>
				</div>
			</ScrollArea>
		</main>
	);
};

export default ListeningHistoryPage;
