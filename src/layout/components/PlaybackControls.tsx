import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Laptop2, ListMusic, Mic2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const {
		currentSong,
		isPlaying,
		upNextQueue,
		togglePlay,
		playNext,
		playPrevious,
		removeFromUpNextQueue,
		clearUpNextQueue,
		isQueueOpen,
		toggleQueuePanel,
	} = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='relative h-20 sm:h-24 border-t border-zinc-800 bg-zinc-900 px-4'>
			{isQueueOpen && (
				<div className='absolute bottom-full right-4 mb-3 w-[360px] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl'>
					<div className='mb-4 flex items-center justify-between gap-3'>
						<div>
							<h3 className='font-semibold text-white'>Up Next Queue</h3>
							<p className='text-xs text-zinc-500'>{upNextQueue.length} songs waiting to play next</p>
						</div>
						<div className='flex items-center gap-2'>
							<Button variant='ghost' size='sm' onClick={() => void clearUpNextQueue()} disabled={upNextQueue.length === 0}>
								Clear
							</Button>
							<Button variant='ghost' size='icon' onClick={toggleQueuePanel}>
								<X className='h-4 w-4' />
							</Button>
						</div>
					</div>

					<div className='max-h-72 space-y-2 overflow-y-auto pr-1'>
						{upNextQueue.length > 0 ? (
							upNextQueue.map((song, index) => (
								<div key={`${song._id}-${index}`} className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3'>
									<img src={song.imageUrl} alt={song.title} className='h-12 w-12 rounded-lg object-cover' />
									<div className='min-w-0 flex-1'>
										<p className='truncate font-medium text-white'>{song.title}</p>
										<p className='truncate text-xs text-zinc-400'>{song.artist}</p>
									</div>
									<Button variant='ghost' size='icon' onClick={() => void removeFromUpNextQueue(song._id)}>
										<X className='h-4 w-4' />
									</Button>
								</div>
							))
						) : (
							<div className='rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500'>
								Add songs with the queue button to make them play right after the current song.
							</div>
						)}
					</div>
				</div>
			)}

			<div className='mx-auto flex h-full max-w-[1800px] items-center justify-between'>
				<div className='hidden min-w-[180px] w-[30%] items-center gap-4 sm:flex'>
					{currentSong && (
						<>
							<img src={currentSong.imageUrl} alt={currentSong.title} className='h-14 w-14 rounded-md object-cover' />
							<div className='min-w-0 flex-1'>
								<div className='cursor-pointer truncate font-medium hover:underline'>{currentSong.title}</div>
								<div className='cursor-pointer truncate text-sm text-zinc-400 hover:underline'>{currentSong.artist}</div>
							</div>
						</>
					)}
				</div>

				<div className='flex max-w-full flex-1 flex-col items-center gap-2 sm:max-w-[45%]'>
					<div className='flex items-center gap-4 sm:gap-6'>
						<Button size='icon' variant='ghost' className='hidden text-zinc-400 hover:text-white sm:inline-flex'>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white' onClick={playPrevious} disabled={!currentSong}>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button size='icon' className='h-8 w-8 rounded-full bg-white text-black hover:bg-white/80' onClick={togglePlay} disabled={!currentSong}>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>

						<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white' onClick={() => void playNext()} disabled={!currentSong}>
							<SkipForward className='h-4 w-4' />
						</Button>

						<Button size='icon' variant='ghost' className='hidden text-zinc-400 hover:text-white sm:inline-flex'>
							<Repeat className='h-4 w-4' />
						</Button>
					</div>

					<div className='hidden w-full items-center gap-2 sm:flex'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full active:cursor-grabbing hover:cursor-grab'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>

				<div className='hidden min-w-[180px] w-[30%] items-center justify-end gap-4 sm:flex'>
					<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white'>
						<Mic2 className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white' onClick={toggleQueuePanel}>
						<ListMusic className='h-4 w-4' />
					</Button>
					<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white'>
						<Laptop2 className='h-4 w-4' />
					</Button>

					<div className='flex items-center gap-2'>
						<Button size='icon' variant='ghost' className='text-zinc-400 hover:text-white'>
							<Volume1 className='h-4 w-4' />
						</Button>
						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 active:cursor-grabbing hover:cursor-grab'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
