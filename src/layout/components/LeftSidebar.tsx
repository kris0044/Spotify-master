import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Heart, Music2, User, Mic, History, MessagesSquare, Bell, Disc3, Youtube, Trophy, Users, Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const mobilePrimaryNav = [
	{ to: "/", label: "Home", icon: HomeIcon },
	{ to: "/songs", label: "Songs", icon: Music2 },
	{ to: "/artists", label: "Artists", icon: Users },
	{ to: "/playlists", label: "Library", icon: Library },
] as const;

const sharedSignedInNav = [
	{ to: "/chat", label: "Messages", icon: MessageCircle },
	{ to: "/community", label: "Community", icon: MessagesSquare },
	{ to: "/notifications", label: "Notifications", icon: Bell },
	{ to: "/favorites", label: "Favorites", icon: Heart },
	{ to: "/history", label: "History", icon: History },
	{ to: "/publicmusic", label: "Public Music", icon: Youtube },
	{ to: "/publicmusic/top100", label: "Top 100", icon: Trophy },
	{ to: "/artists", label: "Artists", icon: Users },
	{ to: "/albums", label: "Albums", icon: Disc3 },
	{ to: "/playlists", label: "Playlists", icon: Music2 },
] as const;

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const { playlists, fetchPlaylists } = usePlaylistStore();
	const { isAdmin, isArtist } = useAuthStore();

	useEffect(() => {
		fetchAlbums();
		fetchPlaylists();
	}, [fetchAlbums, fetchPlaylists]);

	return (
		<div className='hidden h-full flex-col gap-2 md:flex'>
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
								to={"/artists"}
								className={cn(
									buttonVariants({
										variant: "ghost",
										className: "w-full justify-center px-2 text-white hover:bg-zinc-800 md:justify-start md:px-4",
									})
								)}
							>
								<Users className='mr-2 size-5' />
								<span className='hidden md:inline'>Artists</span>
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

export const MobileBottomNav = () => {
	const { isAdmin, isArtist } = useAuthStore();
	const location = useLocation();
	const [isMoreOpen, setIsMoreOpen] = useState(false);

	const extraNav = [
		{ to: "/publicmusic", label: "Public Music", icon: Youtube },
		{ to: "/publicmusic/top100", label: "Top 100", icon: Trophy },
		{ to: "/albums", label: "Albums", icon: Disc3 },
		{ to: "/favorites", label: "Favorites", icon: Heart },
		{ to: "/history", label: "History", icon: History },
		{ to: "/notifications", label: "Notifications", icon: Bell },
		{ to: "/community", label: "Community", icon: MessagesSquare },
		{ to: "/chat", label: "Messages", icon: MessageCircle },
		...(isArtist || isAdmin ? [{ to: "/artist", label: "Artist Dashboard", icon: Mic }] : []),
		...(isAdmin ? [{ to: "/admin", label: "Admin", icon: User }] : []),
	];
	const moreNav = [...sharedSignedInNav, ...extraNav].filter(
		(item, index, array) => array.findIndex((candidate) => candidate.to === item.to) === index
	);

	return (
		<nav className='border-t border-white/10 bg-zinc-950/95 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.4rem)] pt-2 backdrop-blur-xl md:hidden'>
			<div className='grid grid-cols-5 gap-1'>
				{mobilePrimaryNav.map((item) => {
					const Icon = item.icon;

					return (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								cn(
									"flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition",
									isActive
										? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.12)]"
										: "text-zinc-400 hover:bg-white/5 hover:text-white"
								)
							}
						>
							<Icon className='h-4 w-4' />
							<span className='truncate'>{item.label}</span>
						</NavLink>
					);
				})}

				<Dialog open={isMoreOpen} onOpenChange={setIsMoreOpen}>
					<DialogTrigger asChild>
						<button className='flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white'>
							<Ellipsis className='h-4 w-4' />
							<span className='truncate'>More</span>
						</button>
					</DialogTrigger>
					<DialogContent className='max-h-[85vh] w-[calc(100vw-1.5rem)] max-w-md overflow-hidden rounded-[28px] border-white/10 bg-zinc-950 p-0 text-white'>
						<DialogHeader className='border-b border-white/10 px-5 py-4 text-left'>
							<DialogTitle className='text-xl text-white'>Browse More</DialogTitle>
						</DialogHeader>
						<ScrollArea className='max-h-[70vh]'>
							<div className='grid gap-2 p-4'>
								{moreNav.map((item) => {
									const Icon = item.icon;
									const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

									return (
										<NavLink
											key={item.to}
											to={item.to}
											onClick={() => setIsMoreOpen(false)}
											className={cn(
												"flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
												isActive
													? "border-emerald-300/40 bg-emerald-100 text-black"
													: "border-white/10 bg-black/30 text-zinc-100 hover:bg-white/10"
											)}
										>
											<Icon className='h-4 w-4 shrink-0' />
											<span className='truncate'>{item.label}</span>
										</NavLink>
									);
								})}
							</div>
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</div>
		</nav>
	);
};
