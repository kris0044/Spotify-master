import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resolvePublicMusicSong, searchUnifiedSongs } from "@/lib/ytMusic";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pause, Plus, Play, Trash2, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Topbar from "@/components/Topbar";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { buildSongDetailHref } from "@/lib/songDetail";

const PlaylistDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { currentPlaylist, fetchPlaylistById, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, isLoading } =
		usePlaylistStore();
	const { songs, fetchSongs } = useMusicStore();
	const { playAlbum, currentSong, isPlaying, togglePlay } = usePlayerStore();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState("");
	const [songSearch, setSongSearch] = useState("");
	const [searchResults, setSearchResults] = useState<Song[]>([]);

	useEffect(() => {
		if (id) {
			fetchPlaylistById(id);
		}
	}, [id, fetchPlaylistById]);

	useEffect(() => {
		fetchSongs();
	}, [fetchSongs]);

	useEffect(() => {
		let isMounted = true;

		const loadSearchResults = async () => {
			const trimmedQuery = songSearch.trim();
			if (!trimmedQuery) {
				setSearchResults([]);
				return;
			}

			try {
				const results = await searchUnifiedSongs(trimmedQuery, "", 20);
				if (!isMounted) return;
				setSearchResults(results);
			} catch {
				if (!isMounted) return;
				setSearchResults([]);
			}
		};

		void loadSearchResults();

		return () => {
			isMounted = false;
		};
	}, [songSearch]);

	const handleAddSong = async () => {
		if (!selectedSongId || !id) return;

		const selectedSong = filteredSongs.find((song) => song._id === selectedSongId);
		if (!selectedSong) return;

		let songId = selectedSongId;
		if (selectedSong.source === "youtube_music" && selectedSong.externalVideoId) {
			const resolvedSong = await resolvePublicMusicSong({
				videoId: selectedSong.externalVideoId,
				title: selectedSong.title,
				artist: selectedSong.artist,
				album: selectedSong.albumId,
				duration: selectedSong.duration,
				thumbnailUrl: selectedSong.imageUrl,
				internalSongId: selectedSong._id.startsWith("search-public-") ? null : selectedSong._id,
			});
			songId = resolvedSong._id;
		}

		await addSongToPlaylist(id, songId);
		setSelectedSongId("");
		setIsAddDialogOpen(false);
	};

	const handlePlayPlaylist = () => {
		if (currentPlaylist && currentPlaylist.songs.length > 0) {
			playAlbum(currentPlaylist.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentPlaylist || currentPlaylist.songs.length === 0) return;

		const playlistSongs = currentPlaylist.songs as Song[];
		const selectedSong = playlistSongs[index];
		const isCurrentSong = currentSong?._id === selectedSong._id;

		if (isCurrentSong) {
			togglePlay();
			return;
		}

		playAlbum(playlistSongs, index);
	};

	const handleDeletePlaylist = async () => {
		if (!id) return;
		await deletePlaylist(id);
		navigate("/playlists");
	};

	const availableSongs = songs.filter(
		(song) => !currentPlaylist?.songs.some((s) => (s as Song)._id === song._id)
	);
	const searchPool = songSearch.trim() ? searchResults : availableSongs;
	const filteredSongs = searchPool.filter(
		(song) =>
			!currentPlaylist?.songs.some((playlistSong) => (playlistSong as Song)._id === song._id) &&
			`${song.title} ${song.artist}`.toLowerCase().includes(songSearch.trim().toLowerCase())
	);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					{isLoading ? (
						<div className='text-center py-8'>Loading playlist...</div>
					) : !currentPlaylist ? (
						<div className='text-center py-8'>
							<p>Playlist not found</p>
							<Button onClick={() => navigate("/playlists")} className='mt-4'>
								Back to Playlists
							</Button>
						</div>
					) : (
						<>
							<div className='mb-6 flex flex-col items-start gap-4 sm:gap-6 lg:flex-row'>
								<div className='aspect-square w-36 sm:w-48 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 self-center lg:self-auto'>
									<Play className='size-16 text-white opacity-80' />
								</div>
								<div className='flex-1'>
									<p className='text-sm text-zinc-400 mb-2'>Playlist</p>
									<h1 className='text-4xl font-bold mb-2'>{currentPlaylist.name}</h1>
									{currentPlaylist.description && (
										<p className='text-zinc-400 mb-4'>{currentPlaylist.description}</p>
									)}
									<p className='text-sm text-zinc-400 mb-4'>
										{currentPlaylist.songs.length} {currentPlaylist.songs.length === 1 ? "song" : "songs"}
									</p>
									<div className='flex flex-wrap items-center gap-2'>
										<Button onClick={handlePlayPlaylist} disabled={currentPlaylist.songs.length === 0} className='w-full sm:w-auto'>
											<Play className='mr-2 size-4' />
											Play
										</Button>
										<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
											<DialogTrigger asChild>
												<Button variant='outline' className='w-full sm:w-auto'>
													<Plus className='mr-2 size-4' />
													Add Songs
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Add Song to Playlist</DialogTitle>
													<DialogDescription>Select a song to add to this playlist.</DialogDescription>
												</DialogHeader>
												<Input
													value={songSearch}
													onChange={(event) => setSongSearch(event.target.value)}
													placeholder='Search songs'
												/>
												<Select value={selectedSongId} onValueChange={setSelectedSongId}>
													<SelectTrigger>
														<SelectValue placeholder='Select a song' />
													</SelectTrigger>
													<SelectContent>
														{filteredSongs.map((song) => (
															<SelectItem key={song._id} value={song._id}>
																{song.title} - {song.artist}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<DialogFooter>
													<Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
														Cancel
													</Button>
													<Button onClick={handleAddSong} disabled={!selectedSongId}>
														Add
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
										<Button variant='destructive' onClick={handleDeletePlaylist} className='w-full sm:w-auto'>
											<Trash2 className='mr-2 size-4' />
											Delete
										</Button>
									</div>
								</div>
							</div>

							<div className='space-y-4'>
								{currentPlaylist.songs.length === 0 ? (
									<div className='text-center py-8 text-zinc-400'>
										<p>This playlist is empty.</p>
										<p className='text-sm mt-2'>Add some songs to get started!</p>
									</div>
								) : (
									<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
										{currentPlaylist.songs.map((song, index) => {
											const playlistSong = song as Song;
											const isCurrentSong = currentSong?._id === playlistSong._id;

											return (
												<div
													key={playlistSong._id}
													className='group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(39,39,42,0.94),rgba(9,9,11,0.98))] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-zinc-900'
												>
													<div className='relative mb-4 overflow-hidden rounded-[22px]'>
														<div className='absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur'>
															#{index + 1}
														</div>
														<Button
															size='icon'
															variant='ghost'
															onClick={() => {
																if (id) {
																	void removeSongFromPlaylist(id, playlistSong._id);
																}
															}}
															className='absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-black/50 text-white opacity-0 backdrop-blur-md transition-opacity duration-300 hover:bg-black/70 group-hover:opacity-100'
														>
															<X className='size-4' />
														</Button>
														<div className='aspect-square overflow-hidden rounded-[22px] shadow-xl ring-1 ring-white/10'>
															<Link to={buildSongDetailHref(playlistSong)} state={{ song: playlistSong }}>
																<img
																	src={playlistSong.imageUrl}
																	alt={playlistSong.title}
																	className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
																/>
															</Link>
														</div>
														<Button
															size='icon'
															onClick={() => handlePlaySong(index)}
															className={`absolute bottom-3 right-3 rounded-full bg-green-500 text-black shadow-[0_12px_30px_rgba(34,197,94,0.35)] transition-all hover:scale-105 hover:bg-green-400 ${
																isCurrentSong ? "opacity-100" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
															}`}
														>
															{isCurrentSong && isPlaying ? <Pause className='size-5 text-black' /> : <Play className='size-5 text-black' />}
														</Button>
													</div>

													<div className='space-y-2'>
														<Link to={buildSongDetailHref(playlistSong)} state={{ song: playlistSong }} className='block'>
															<h3 className='truncate text-lg font-semibold text-white transition group-hover:text-emerald-300'>{playlistSong.title}</h3>
															<p className='truncate text-sm text-zinc-400'>{playlistSong.artist}</p>
														</Link>
														<p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
															{playlistSong.duration ? `${Math.floor(playlistSong.duration / 60)}:${(playlistSong.duration % 60).toString().padStart(2, "0")}` : "Unknown duration"}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default PlaylistDetailPage;

