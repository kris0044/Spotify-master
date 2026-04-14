import { Button } from "@/components/ui/button";
import { buildArtistProfileHref } from "@/lib/artistProfile";
import { PublicMusicAlbumSpotlight, PublicMusicArtistSpotlight } from "@/types";
import { ArrowUpRight, Mic2, Radio, LibraryBig } from "lucide-react";
import { Link } from "react-router-dom";

type PublicMusicSpotlightProps = {
	artists: PublicMusicArtistSpotlight[];
	albums: PublicMusicAlbumSpotlight[];
};

const PublicMusicSpotlight = ({ artists, albums }: PublicMusicSpotlightProps) => {
	if (artists.length === 0 && albums.length === 0) {
		return null;
	}

	return (
		<section className='mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]'>
			<div className='rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.16),_transparent_28%),linear-gradient(180deg,_rgba(24,24,27,0.96),_rgba(9,9,11,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]'>
				<div className='mb-5 flex items-center justify-between gap-3'>
					<div>
						<div className='mb-2 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-red-200'>
							<Radio className='h-3.5 w-3.5' />
							Public artist radar
						</div>
						<h2 className='text-2xl font-semibold tracking-tight text-white'>Artists people are finding now</h2>
						<p className='mt-2 text-sm text-zinc-400'>Live artist, song, and album cues pulled from the public music feed.</p>
					</div>
					<Button asChild variant='outline' className='border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white'>
						<Link to='/publicmusic'>
							Open PublicMusic
							<ArrowUpRight className='h-4 w-4' />
						</Link>
					</Button>
				</div>

				<div className='grid gap-3 md:grid-cols-2'>
					{artists.map((artist) => (
						<div key={artist.name} className='rounded-[24px] border border-white/10 bg-black/25 p-4'>
							<div className='flex items-center gap-3'>
								<img src={artist.imageUrl} alt={artist.name} className='h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10' />
								<div className='min-w-0 flex-1'>
									<Link to={buildArtistProfileHref(artist.name)} className='block truncate text-lg font-semibold text-white transition hover:text-sky-300'>
										{artist.name}
									</Link>
									<p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
										{artist.songCount} songs | {artist.albumCount} albums
									</p>
								</div>
								<Mic2 className='h-5 w-5 text-red-200' />
							</div>

							<div className='mt-4 space-y-2'>
								{artist.songs.map((song) => (
									<div key={song._id} className='rounded-xl border border-white/10 bg-white/5 px-3 py-2'>
										<p className='truncate text-sm font-medium text-white'>{song.title}</p>
										<p className='truncate text-xs text-zinc-400'>{song.albumId || "Single release"}</p>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className='rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_25%),linear-gradient(180deg,_rgba(24,24,27,0.96),_rgba(9,9,11,0.98))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]'>
				<div className='mb-5'>
					<div className='mb-2 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-sky-200'>
						<LibraryBig className='h-3.5 w-3.5' />
						Album pulse
					</div>
					<h2 className='text-2xl font-semibold tracking-tight text-white'>Albums worth pulling into playlists</h2>
				</div>

				<div className='space-y-3'>
					{albums.map((album) => (
						<div key={`${album.artist}-${album.title}`} className='flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/25 p-3'>
							<img src={album.imageUrl} alt={album.title} className='h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10' />
							<div className='min-w-0 flex-1'>
								<p className='truncate text-base font-semibold text-white'>{album.title}</p>
								<p className='truncate text-sm text-zinc-400'>{album.artist}</p>
								<p className='mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500'>{album.songs.length} public songs surfaced</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default PublicMusicSpotlight;
