import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Heart, Music2, User, Mic, History, MessagesSquare, Bell, Disc3, Youtube, Trophy } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const { playlists, fetchPlaylists } = usePlaylistStore();
	const { isAdmin, isArtist } = useAuthStore();

	useEffect(() => {
		fetchAlbums();
		fetchPlaylists();
	}, [fetchAlbums, fetchPlaylists]);

	return (
		<div className='h-full flex flex-col gap-2'>
			{/* Navigation menu */}

			<div className='rounded-lg bg-zinc-900 p-2 md:p-4'>
				<ScrollArea className='h-[320px] pr-1 md:h-[350px] md:pr-2'>
					<div className='space-y-2'>
						<Link
							to={"/"}
							className={cn(
								buttonVariants({
									variant: "ghost",
									className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
								})
							)}
						>
							<HomeIcon className='mr-2 size-5' />
							<span className='hidden md:inline'>Home</span>
						</Link>

						<SignedIn>
							<Link
								to={"/chat"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<MessageCircle className='mr-2 size-5' />
								<span className='hidden md:inline'>Messages</span>
							</Link>
							<Link
								to={"/community"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<MessagesSquare className='mr-2 size-5' />
								<span className='hidden md:inline'>Community</span>
							</Link>
							<Link
								to={"/notifications"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Bell className='mr-2 size-5' />
								<span className='hidden md:inline'>Notifications</span>
							</Link>
							<Link
								to={"/favorites"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Heart className='mr-2 size-5' />
								<span className='hidden md:inline'>Favorites</span>
							</Link>
							<Link
								to={"/history"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<History className='mr-2 size-5' />
								<span className='hidden md:inline'>History</span>
							</Link>
							<Link
								to={"/publicmusic"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Youtube className='mr-2 size-5' />
								<span className='hidden md:inline'>PublicMusic</span>
							</Link>
							<Link
								to={"/publicmusic/top100"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Trophy className='mr-2 size-5' />
								<span className='hidden md:inline'>Top 100</span>
							</Link>
							<Link
								to={"/albums"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Disc3 className='mr-2 size-5' />
								<span className='hidden md:inline'>Albums</span>
							</Link>
							<Link
								to={"/playlists"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Music2 className='mr-2 size-5' />
								<span className='hidden md:inline'>Playlists</span>
							</Link>
							{(isArtist || isAdmin) && (
								<Link
									to={"/artist"}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
										})
									)}
								>
									<Mic className='mr-2 size-5' />
									<span className='hidden md:inline'>Artist</span>
								</Link>
							)}
							{isAdmin && (
								<Link
									to={"/admin"}
									className={cn(
										buttonVariants({
											variant: "ghost",
											className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
										})
									)}
								>
									<User className='mr-2 size-5' />
									<span className='hidden md:inline'>Admin</span>
								</Link>
							)}
						</SignedIn>
					</div>
				</ScrollArea>
			</div>

			{/* Library section */}
			<div className='flex-1 rounded-lg bg-zinc-900 p-2 md:p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center text-white px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Your Library</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-470px)] min-h-[200px] pr-1 md:h-[350px] md:pr-2'>
					<div className='space-y-2'>
						<SignedIn>
							{playlists.map((playlist) => (
								<Link
									to={`/playlists/${playlist._id}`}
									key={playlist._id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<div className='size-12 rounded-md flex-shrink-0 bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center'>
										<Music2 className='size-6 text-white opacity-80' />
									</div>
									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{playlist.name}</p>
										<p className='text-sm text-zinc-400 truncate'>
											Playlist • {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
										</p>
									</div>
								</Link>
							))}
						</SignedIn>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<Link
									to={`/albums/${album._id}`}
									key={album._id}
									className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<img
										src={album.imageUrl}
										alt='Album img'
										className='size-12 rounded-md flex-shrink-0 object-cover'
									/>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
