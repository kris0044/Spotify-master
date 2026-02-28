import { useState, useEffect } from "react";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Song } from "@/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface SongActionsProps {
	song: Song;
	showFavorite?: boolean;
	showPlaylist?: boolean;
}

const SongActions = ({ song, showFavorite = true, showPlaylist = true }: SongActionsProps) => {
	const { addToFavorites, removeFromFavorites, checkIsFavorite } = useFavoriteStore();
	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const [isFavoriteState, setIsFavoriteState] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

	useEffect(() => {
		if (showFavorite) {
			checkIsFavorite(song._id).then(setIsFavoriteState);
		}
	}, [song._id, showFavorite, checkIsFavorite]);

	useEffect(() => {
		if (showPlaylist && isDialogOpen) {
			fetchPlaylists();
		}
	}, [showPlaylist, isDialogOpen, fetchPlaylists]);

	const handleFavoriteToggle = async () => {
		if (isFavoriteState) {
			await removeFromFavorites(song._id);
			setIsFavoriteState(false);
		} else {
			await addToFavorites(song._id);
			setIsFavoriteState(true);
		}
	};

	const handleAddToPlaylist = async () => {
		if (!selectedPlaylistId) return;
		await addSongToPlaylist(selectedPlaylistId, song._id);
		setIsDialogOpen(false);
		setSelectedPlaylistId("");
	};

	return (
		<div className='flex items-center gap-2'>
			{showFavorite && (
				<Button
					size='sm'
					variant='ghost'
					onClick={handleFavoriteToggle}
					className={isFavoriteState ? "text-red-500 hover:text-red-400" : ""}
				>
					<Heart className={`size-4 ${isFavoriteState ? "fill-current" : ""}`} />
				</Button>
			)}
			{showPlaylist && (
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button size='sm' variant='ghost'>
							<Plus className='size-4' />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add to Playlist</DialogTitle>
							<DialogDescription>Select a playlist to add this song to.</DialogDescription>
						</DialogHeader>
						<Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
							<SelectTrigger>
								<SelectValue placeholder='Select a playlist' />
							</SelectTrigger>
							<SelectContent>
								{playlists.map((playlist) => (
									<SelectItem key={playlist._id} value={playlist._id}>
										{playlist.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<DialogFooter>
							<Button variant='outline' onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleAddToPlaylist} disabled={!selectedPlaylistId}>
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default SongActions;

