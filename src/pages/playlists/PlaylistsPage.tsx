import { useEffect, useState } from "react";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Button } from "@/components/ui/button";
import { Plus, Music, Trash2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import Topbar from "@/components/Topbar";
import { usePlayerStore } from "@/stores/usePlayerStore";

const PlaylistsPage = () => {
	const { playlists, fetchPlaylists, createPlaylist, deletePlaylist, isLoading } = usePlaylistStore();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [playlistName, setPlaylistName] = useState("");
	const [playlistDescription, setPlaylistDescription] = useState("");
	const { playAlbum } = usePlayerStore();

	useEffect(() => {
		fetchPlaylists();
	}, [fetchPlaylists]);

	const handleCreatePlaylist = async () => {
		if (!playlistName.trim()) return;
		await createPlaylist(playlistName, playlistDescription);
		setPlaylistName("");
		setPlaylistDescription("");
		setIsDialogOpen(false);
	};

	const handlePlayPlaylist = (songs: any[]) => {
		if (songs.length > 0) {
			playAlbum(songs, 0);
		}
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl sm:text-3xl font-bold'>Your Playlists</h1>
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<Button className='bg-emerald-500 hover:bg-emerald-600'>
									<Plus className='mr-2 size-4' />
									Create Playlist
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create New Playlist</DialogTitle>
									<DialogDescription>Give your playlist a name and description.</DialogDescription>
								</DialogHeader>
								<div className='space-y-4'>
									<Input
										placeholder='Playlist name'
										value={playlistName}
										onChange={(e) => setPlaylistName(e.target.value)}
									/>
									<Input
										placeholder='Description (optional)'
										value={playlistDescription}
										onChange={(e) => setPlaylistDescription(e.target.value)}
									/>
								</div>
								<DialogFooter>
									<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
										Cancel
									</Button>
									<Button onClick={handleCreatePlaylist} disabled={!playlistName.trim()}>
										Create
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					{isLoading ? (
						<div className='text-center py-8'>Loading playlists...</div>
					) : playlists.length === 0 ? (
						<div className='text-center py-8 text-zinc-400'>
							<Music className='size-16 mx-auto mb-4 opacity-50' />
							<p>You don't have any playlists yet.</p>
							<p className='text-sm mt-2'>Create your first playlist to get started!</p>
						</div>
					) : (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
							{playlists.map((playlist) => (
								<div
									key={playlist._id}
									className='bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors group'
								>
									<Link to={`/playlists/${playlist._id}`}>
										<div className='aspect-square bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg mb-3 flex items-center justify-center'>
											<Music className='size-12 text-white opacity-80' />
										</div>
										<h3 className='font-semibold truncate'>{playlist.name}</h3>
										<p className='text-sm text-zinc-400 mt-1'>
											{playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
										</p>
									</Link>
									<div className='flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity'>
										<Button
											size='sm'
											variant='ghost'
											onClick={() => handlePlayPlaylist(playlist.songs)}
											disabled={playlist.songs.length === 0}
										>
											Play
										</Button>
										<Button
											size='sm'
											variant='ghost'
											onClick={(e) => {
												e.preventDefault();
												deletePlaylist(playlist._id);
											}}
										>
											<Trash2 className='size-4' />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default PlaylistsPage;

