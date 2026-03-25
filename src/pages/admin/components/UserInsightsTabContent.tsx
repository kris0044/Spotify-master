import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/stores/useAdminStore";
import { Heart, ListMusic, Music2, Users2 } from "lucide-react";
import { useEffect } from "react";

const numberFormatter = new Intl.NumberFormat("en-US");

const formatDate = (value?: string) => {
	if (!value) {
		return "N/A";
	}

	return new Date(value).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

const formatDuration = (seconds: number) => {
	if (!seconds) {
		return "0m";
	}

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}

	return `${minutes}m`;
};

const UserInsightsTabContent = () => {
	const { userInsights, isLoading, fetchUserInsights } = useAdminStore();

	useEffect(() => {
		void fetchUserInsights();
	}, [fetchUserInsights]);

	const overview = userInsights?.overview;

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>User Playlists</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.totalPlaylists || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-sky-400/10 p-3 text-sky-300'>
							<ListMusic className='h-5 w-5' />
						</div>
					</div>
				</div>

				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Playlist Creators</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.activePlaylistCreators || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-emerald-400/10 p-3 text-emerald-300'>
							<Users2 className='h-5 w-5' />
						</div>
					</div>
				</div>

				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Favorite Actions</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.totalFavoriteActions || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-rose-400/10 p-3 text-rose-300'>
							<Heart className='h-5 w-5' />
						</div>
					</div>
				</div>

				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Avg Songs / Playlist</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{overview ? overview.avgSongsPerPlaylist.toFixed(1) : "0.0"}
							</p>
						</div>
						<div className='rounded-2xl bg-amber-400/10 p-3 text-amber-300'>
							<Music2 className='h-5 w-5' />
						</div>
					</div>
				</div>
			</div>

			<Card className='border-zinc-700/50 bg-zinc-800/50'>
				<CardHeader>
					<CardTitle className='text-white'>User-created playlists</CardTitle>
					<CardDescription>
						Admin-only visibility into playlists users created, who owns them, when they changed, and what tracks they
						contain.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className='max-h-[560px]'>
						<Table>
							<TableHeader>
								<TableRow className='hover:bg-zinc-800/50'>
									<TableHead>Playlist</TableHead>
									<TableHead>Owner</TableHead>
									<TableHead>Songs</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Updated</TableHead>
									<TableHead>Preview</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{userInsights?.playlists.length ? (
									userInsights.playlists.map((playlist) => (
										<TableRow key={playlist._id} className='hover:bg-zinc-800/50'>
											<TableCell className='min-w-[220px]'>
												<div>
													<p className='font-medium text-white'>{playlist.name}</p>
													<p className='mt-1 text-xs text-zinc-400'>
														{playlist.description?.trim() || "No description"}
													</p>
													<p className='mt-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500'>
														Created {formatDate(playlist.createdAt)}
													</p>
												</div>
											</TableCell>
											<TableCell className='min-w-[180px]'>
												<div className='flex items-center gap-3'>
													{playlist.owner?.imageUrl ? (
														<img
															src={playlist.owner.imageUrl}
															alt={playlist.owner.fullName}
															className='h-10 w-10 rounded-xl object-cover'
														/>
													) : (
														<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700 text-sm font-semibold text-white'>
															{playlist.owner?.fullName?.charAt(0).toUpperCase() || "?"}
														</div>
													)}
													<div>
														<p className='font-medium text-white'>{playlist.owner?.fullName || "Unknown user"}</p>
														<p className='text-xs text-zinc-500'>{playlist.owner?.role || "user"}</p>
													</div>
												</div>
											</TableCell>
											<TableCell className='text-zinc-300'>{numberFormatter.format(playlist.songCount)}</TableCell>
											<TableCell className='text-zinc-300'>{formatDuration(playlist.totalDuration)}</TableCell>
											<TableCell className='text-zinc-300'>{formatDate(playlist.updatedAt)}</TableCell>
											<TableCell className='min-w-[280px]'>
												{playlist.songs.length ? (
													<div className='space-y-2'>
														{playlist.songs.slice(0, 3).map((song) => (
															<div key={song._id} className='flex items-center gap-3 rounded-xl bg-zinc-900/80 px-3 py-2'>
																<img src={song.imageUrl} alt={song.title} className='h-10 w-10 rounded-lg object-cover' />
																<div className='min-w-0'>
																	<p className='truncate text-sm font-medium text-white'>{song.title}</p>
																	<p className='truncate text-xs text-zinc-400'>{song.artist}</p>
																</div>
															</div>
														))}
														{playlist.songCount > 3 ? (
															<p className='text-xs text-zinc-500'>+{playlist.songCount - 3} more songs</p>
														) : null}
													</div>
												) : (
													<span className='text-sm text-zinc-500'>No songs yet</span>
												)}
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className='py-10 text-center text-zinc-500'>
											{isLoading ? "Loading user playlists..." : "No user playlists found."}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>

			<Card className='border-zinc-700/50 bg-zinc-800/50'>
				<CardHeader>
					<CardTitle className='text-white'>Top 10 favorited songs</CardTitle>
					<CardDescription>
						The songs users add to favorites most often, with catalog context admins can use for moderation and
						merchandising.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className='hover:bg-zinc-800/50'>
								<TableHead>Song</TableHead>
								<TableHead>Favorites</TableHead>
								<TableHead>Genre</TableHead>
								<TableHead>Source</TableHead>
								<TableHead>Plays</TableHead>
								<TableHead>Last Favorited</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{userInsights?.topFavoritedSongs.length ? (
								userInsights.topFavoritedSongs.map((song) => (
									<TableRow key={song._id} className='hover:bg-zinc-800/50'>
										<TableCell className='min-w-[240px]'>
											<div className='flex items-center gap-3'>
												<img src={song.imageUrl} alt={song.title} className='h-12 w-12 rounded-xl object-cover' />
												<div>
													<p className='font-medium text-white'>{song.title}</p>
													<p className='text-xs text-zinc-400'>{song.artist}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className='font-medium text-white'>
											{numberFormatter.format(song.favoritesCount)}
										</TableCell>
										<TableCell className='text-zinc-300'>{song.genre || "Unspecified"}</TableCell>
										<TableCell className='text-zinc-300'>{song.source || "local"}</TableCell>
										<TableCell className='text-zinc-300'>{numberFormatter.format(song.playCount || 0)}</TableCell>
										<TableCell className='text-zinc-300'>{formatDate(song.lastFavoritedAt)}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={7} className='py-10 text-center text-zinc-500'>
										{isLoading ? "Loading favorites analytics..." : "No favorite activity found yet."}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserInsightsTabContent;
