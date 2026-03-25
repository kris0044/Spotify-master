import { useState, useEffect } from "react";
import { Bell, BellOff, Heart, ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ensureResolvableSong, isTemporaryPublicSongId } from "@/lib/ytMusic";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useFollowStore } from "@/stores/useFollowStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song } from "@/types";
import toast from "react-hot-toast";
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
	showFollow?: boolean;
}

const SongActions = ({ song, showFavorite = true, showPlaylist = true, showFollow = true }: SongActionsProps) => {
	const { addToFavorites, removeFromFavorites, checkIsFavorite } = useFavoriteStore();
	const { playlists, fetchPlaylists, addSongToPlaylist } = usePlaylistStore();
	const { fetchFollowing, isFollowingSong, followSong, unfollowSong, isHydrated } = useFollowStore();
	const { addToUpNextQueue } = usePlayerStore();
	const [isFavoriteState, setIsFavoriteState] = useState(false);
	const [isFollowingState, setIsFollowingState] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
	const [playlistSearch, setPlaylistSearch] = useState("");
	const [resolvedSongId, setResolvedSongId] = useState(song._id);

	useEffect(() => {
		setResolvedSongId(song._id);
	}, [song._id]);

	useEffect(() => {
		if (showFavorite) {
			if (isTemporaryPublicSongId(song._id)) {
				setIsFavoriteState(false);
				return;
			}
			checkIsFavorite(song._id).then(setIsFavoriteState);
		}
	}, [song._id, showFavorite, checkIsFavorite]);

	useEffect(() => {
		if (showFollow && !isHydrated) {
			void fetchFollowing();
		}
	}, [showFollow, isHydrated, fetchFollowing]);

	useEffect(() => {
		if (showFollow) {
			if (isTemporaryPublicSongId(resolvedSongId)) {
				setIsFollowingState(false);
				return;
			}
			setIsFollowingState(isFollowingSong(resolvedSongId));
		}
	}, [showFollow, resolvedSongId, isFollowingSong, isHydrated]);

	useEffect(() => {
		if (showPlaylist && isDialogOpen) {
			fetchPlaylists();
		}
	}, [showPlaylist, isDialogOpen, fetchPlaylists]);

	const filteredPlaylists = playlists.filter((playlist) =>
		playlist.name.toLowerCase().includes(playlistSearch.trim().toLowerCase())
	);

	const getActionableSongId = async () => {
		const resolvedSong = await ensureResolvableSong(song);
		setResolvedSongId(resolvedSong._id);
		return resolvedSong._id;
	};

	const handleFavoriteToggle = async () => {
		const actionableSongId = await getActionableSongId();

		if (isFavoriteState) {
			await removeFromFavorites(actionableSongId);
			setIsFavoriteState(false);
		} else {
			await addToFavorites(actionableSongId);
			setIsFavoriteState(true);
		}
	};

	const handleAddToPlaylist = async () => {
		if (!selectedPlaylistId) return;
		const actionableSongId = await getActionableSongId();
		await addSongToPlaylist(selectedPlaylistId, actionableSongId);
		setIsDialogOpen(false);
		setSelectedPlaylistId("");
	};

	const handleFollowToggle = async () => {
		try {
			const actionableSongId = await getActionableSongId();
			if (isFollowingState) {
				await unfollowSong(actionableSongId);
				setIsFollowingState(false);
				toast.success("Unfollowed song");
				return;
			}
			await followSong(actionableSongId);
			setIsFollowingState(true);
			toast.success("Following song");
		} catch (error: any) {
			const message = error.response?.data?.message || "Failed to update follow";
			toast.error(message);
		}
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
				<Button size='sm' variant='ghost' onClick={() => void addToUpNextQueue(song)}>
					<ListPlus className='size-4' />
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
						<Input
							value={playlistSearch}
							onChange={(event) => setPlaylistSearch(event.target.value)}
							placeholder='Search playlists'
						/>
						<Select value={selectedPlaylistId} onValueChange={setSelectedPlaylistId}>
							<SelectTrigger>
								<SelectValue placeholder='Select a playlist' />
							</SelectTrigger>
							<SelectContent>
								{filteredPlaylists.map((playlist) => (
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
			{showFollow && (
				<Button
					size='sm'
					variant='ghost'
					onClick={handleFollowToggle}
					className={isFollowingState ? "text-emerald-500 hover:text-emerald-400" : ""}
				>
					{isFollowingState ? <BellOff className='size-4' /> : <Bell className='size-4' />}
				</Button>
			)}
		</div>
	);
};

export default SongActions;

