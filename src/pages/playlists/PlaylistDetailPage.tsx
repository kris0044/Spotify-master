import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Button } from "@/components/ui/button";
import { Plus, Play, Trash2, X } from "lucide-react";
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

const PlaylistDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { currentPlaylist, fetchPlaylistById, addSongToPlaylist, removeSongFromPlaylist, deletePlaylist, isLoading } =
		usePlaylistStore();
	const { songs, fetchSongs } = useMusicStore();
	const { playAlbum } = usePlayerStore();
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedSongId, setSelectedSongId] = useState("");

	useEffect(() => {
		if (id) {
			fetchPlaylistById(id);
		}
	}, [id, fetchPlaylistById]);

	useEffect(() => {
		fetchSongs();
	}, [fetchSongs]);

	const handleAddSong = async () => {
		if (!selectedSongId || !id) return;
		await addSongToPlaylist(id, selectedSongId);
		setSelectedSongId("");
		setIsAddDialogOpen(false);
	};

	const handlePlayPlaylist = () => {
		if (currentPlaylist && currentPlaylist.songs.length > 0) {
			playAlbum(currentPlaylist.songs, 0);
		}
	};

	const handleDeletePlaylist = async () => {
		if (!id) return;
		await deletePlaylist(id);
		navigate("/playlists");
	};

	const availableSongs = songs.filter(
		(song) => !currentPlaylist?.songs.some((s) => (s as Song)._id === song._id)
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
							<div className='flex items-start gap-6 mb-6'>
								<div className='aspect-square w-48 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0'>
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
									<div className='flex items-center gap-2'>
										<Button onClick={handlePlayPlaylist} disabled={currentPlaylist.songs.length === 0}>
											<Play className='mr-2 size-4' />
											Play
										</Button>
										<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
											<DialogTrigger asChild>
												<Button variant='outline'>
													<Plus className='mr-2 size-4' />
													Add Songs
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Add Song to Playlist</DialogTitle>
													<DialogDescription>Select a song to add to this playlist.</DialogDescription>
												</DialogHeader>
												<Select value={selectedSongId} onValueChange={setSelectedSongId}>
													<SelectTrigger>
														<SelectValue placeholder='Select a song' />
													</SelectTrigger>
													<SelectContent>
														{availableSongs.map((song) => (
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
										<Button variant='destructive' onClick={handleDeletePlaylist}>
											<Trash2 className='mr-2 size-4' />
											Delete
										</Button>
									</div>
								</div>
							</div>

							<div className='space-y-2'>
								{currentPlaylist.songs.length === 0 ? (
									<div className='text-center py-8 text-zinc-400'>
										<p>This playlist is empty.</p>
										<p className='text-sm mt-2'>Add some songs to get started!</p>
									</div>
								) : (
									currentPlaylist.songs.map((song, index) => (
										<div
											key={(song as Song)._id}
											className='flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 group'
										>
											<span className='text-zinc-400 w-8'>{index + 1}</span>
											<img
												src={(song as Song).imageUrl}
												alt={(song as Song).title}
												className='size-12 rounded object-cover'
											/>
											<div className='flex-1 min-w-0'>
												<p className='font-medium truncate'>{(song as Song).title}</p>
												<p className='text-sm text-zinc-400 truncate'>{(song as Song).artist}</p>
											</div>
											<Button
												size='sm'
												variant='ghost'
												onClick={() => {
													if (id) {
														removeSongFromPlaylist(id, (song as Song)._id);
													}
												}}
												className='opacity-0 group-hover:opacity-100 transition-opacity'
											>
												<X className='size-4' />
											</Button>
										</div>
									))
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

