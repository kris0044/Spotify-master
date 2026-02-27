import { useEffect, useState } from "react";
import { useArtistStore } from "@/stores/useArtistStore";
import { Button } from "@/components/ui/button";
import { Plus, Music, Album, Upload, CheckCircle, XCircle } from "lucide-react";
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
import Topbar from "@/components/Topbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const ArtistPage = () => {
	const { mySongs, myAlbums, fetchMyUploads, uploadSong, uploadAlbum, isLoading, error } = useArtistStore();
	const [isSongDialogOpen, setIsSongDialogOpen] = useState(false);
	const [isAlbumDialogOpen, setIsAlbumDialogOpen] = useState(false);
	const [songForm, setSongForm] = useState({
		title: "",
		artist: "",
		duration: "",
		albumId: "",
		audioFile: null as File | null,
		imageFile: null as File | null,
	});
	const [albumForm, setAlbumForm] = useState({
		title: "",
		artist: "",
		releaseYear: "",
		imageFile: null as File | null,
	});

	useEffect(() => {
		fetchMyUploads();
	}, [fetchMyUploads]);

	const handleUploadSong = async () => {
		if (!songForm.title || !songForm.artist || !songForm.duration || !songForm.audioFile || !songForm.imageFile) {
			return;
		}

		const formData = new FormData();
		formData.append("title", songForm.title);
		formData.append("artist", songForm.artist);
		formData.append("duration", songForm.duration);
		if (songForm.albumId) formData.append("albumId", songForm.albumId);
		formData.append("audioFile", songForm.audioFile);
		formData.append("imageFile", songForm.imageFile);

		await uploadSong(formData);
		setIsSongDialogOpen(false);
		setSongForm({
			title: "",
			artist: "",
			duration: "",
			albumId: "",
			audioFile: null,
			imageFile: null,
		});
	};

	const handleUploadAlbum = async () => {
		if (!albumForm.title || !albumForm.artist || !albumForm.releaseYear || !albumForm.imageFile) {
			return;
		}

		const formData = new FormData();
		formData.append("title", albumForm.title);
		formData.append("artist", albumForm.artist);
		formData.append("releaseYear", albumForm.releaseYear);
		formData.append("imageFile", albumForm.imageFile);

		await uploadAlbum(formData);
		setIsAlbumDialogOpen(false);
		setAlbumForm({
			title: "",
			artist: "",
			releaseYear: "",
			imageFile: null,
		});
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					{error && error.includes("Unauthorized") && (
						<div className='bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6'>
							<p className='text-red-400'>You don't have permission to access the artist dashboard.</p>
							<p className='text-sm text-red-300 mt-2'>Please contact an admin to get artist role.</p>
						</div>
					)}
					<div className='flex items-center justify-between mb-6'>
						<h1 className='text-2xl sm:text-3xl font-bold'>Artist Dashboard</h1>
						<div className='flex gap-2'>
							<Dialog open={isSongDialogOpen} onOpenChange={setIsSongDialogOpen}>
								<DialogTrigger asChild>
									<Button variant='outline'>
										<Upload className='mr-2 size-4' />
										Upload Song
									</Button>
								</DialogTrigger>
								<DialogContent className='max-w-2xl'>
									<DialogHeader>
										<DialogTitle>Upload New Song</DialogTitle>
										<DialogDescription>Upload your song for admin approval.</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div>
											<Label>Title</Label>
											<Input
												value={songForm.title}
												onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
												placeholder='Song title'
											/>
										</div>
										<div>
											<Label>Artist</Label>
											<Input
												value={songForm.artist}
												onChange={(e) => setSongForm({ ...songForm, artist: e.target.value })}
												placeholder='Artist name'
											/>
										</div>
										<div>
											<Label>Duration (seconds)</Label>
											<Input
												type='number'
												value={songForm.duration}
												onChange={(e) => setSongForm({ ...songForm, duration: e.target.value })}
												placeholder='Duration in seconds'
											/>
										</div>
										<div>
											<Label>Album ID (optional)</Label>
											<Input
												value={songForm.albumId}
												onChange={(e) => setSongForm({ ...songForm, albumId: e.target.value })}
												placeholder='Album ID'
											/>
										</div>
										<div>
											<Label>Audio File</Label>
											<Input
												type='file'
												accept='audio/*'
												onChange={(e) =>
													setSongForm({ ...songForm, audioFile: e.target.files?.[0] || null })
												}
											/>
										</div>
										<div>
											<Label>Cover Image</Label>
											<Input
												type='file'
												accept='image/*'
												onChange={(e) =>
													setSongForm({ ...songForm, imageFile: e.target.files?.[0] || null })
												}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button variant='outline' onClick={() => setIsSongDialogOpen(false)}>
											Cancel
										</Button>
										<Button
											onClick={handleUploadSong}
											disabled={
												!songForm.title ||
												!songForm.artist ||
												!songForm.duration ||
												!songForm.audioFile ||
												!songForm.imageFile
											}
										>
											Upload
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
							<Dialog open={isAlbumDialogOpen} onOpenChange={setIsAlbumDialogOpen}>
								<DialogTrigger asChild>
									<Button variant='outline'>
										<Plus className='mr-2 size-4' />
										Upload Album
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Upload New Album</DialogTitle>
										<DialogDescription>Upload your album for admin approval.</DialogDescription>
									</DialogHeader>
									<div className='space-y-4'>
										<div>
											<Label>Title</Label>
											<Input
												value={albumForm.title}
												onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
												placeholder='Album title'
											/>
										</div>
										<div>
											<Label>Artist</Label>
											<Input
												value={albumForm.artist}
												onChange={(e) => setAlbumForm({ ...albumForm, artist: e.target.value })}
												placeholder='Artist name'
											/>
										</div>
										<div>
											<Label>Release Year</Label>
											<Input
												type='number'
												value={albumForm.releaseYear}
												onChange={(e) =>
													setAlbumForm({ ...albumForm, releaseYear: e.target.value })
												}
												placeholder='Release year'
											/>
										</div>
										<div>
											<Label>Cover Image</Label>
											<Input
												type='file'
												accept='image/*'
												onChange={(e) =>
													setAlbumForm({ ...albumForm, imageFile: e.target.files?.[0] || null })
												}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button variant='outline' onClick={() => setIsAlbumDialogOpen(false)}>
											Cancel
										</Button>
										<Button
											onClick={handleUploadAlbum}
											disabled={
												!albumForm.title ||
												!albumForm.artist ||
												!albumForm.releaseYear ||
												!albumForm.imageFile
											}
										>
											Upload
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<Tabs defaultValue='songs' className='space-y-6'>
						<TabsList className='p-1 bg-zinc-800/50'>
							<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
								<Music className='mr-2 size-4' />
								My Songs ({mySongs.length})
							</TabsTrigger>
							<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
								<Album className='mr-2 size-4' />
								My Albums ({myAlbums.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value='songs'>
							{isLoading ? (
								<div className='text-center py-8'>Loading...</div>
							) : mySongs.length === 0 ? (
								<div className='text-center py-8 text-zinc-400'>
									<Music className='size-16 mx-auto mb-4 opacity-50' />
									<p>You haven't uploaded any songs yet.</p>
								</div>
							) : (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
									{mySongs.map((song) => (
										<div
											key={song._id}
											className='bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors'
										>
											<img src={song.imageUrl} alt={song.title} className='w-full aspect-square object-cover rounded mb-3' />
											<h3 className='font-semibold truncate'>{song.title}</h3>
											<p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
											<div className='flex items-center gap-2 mt-2'>
												{song.isApproved ? (
													<span className='text-xs text-emerald-500 flex items-center gap-1'>
														<CheckCircle className='size-3' />
														Approved
													</span>
												) : (
													<span className='text-xs text-yellow-500 flex items-center gap-1'>
														<XCircle className='size-3' />
														Pending
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value='albums'>
							{isLoading ? (
								<div className='text-center py-8'>Loading...</div>
							) : myAlbums.length === 0 ? (
								<div className='text-center py-8 text-zinc-400'>
									<Album className='size-16 mx-auto mb-4 opacity-50' />
									<p>You haven't uploaded any albums yet.</p>
								</div>
							) : (
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
									{myAlbums.map((album) => (
										<div
											key={album._id}
											className='bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors'
										>
											<img
												src={album.imageUrl}
												alt={album.title}
												className='w-full aspect-square object-cover rounded mb-3'
											/>
											<h3 className='font-semibold truncate'>{album.title}</h3>
											<p className='text-sm text-zinc-400 truncate'>{album.artist}</p>
											<div className='flex items-center gap-2 mt-2'>
												{album.isApproved ? (
													<span className='text-xs text-emerald-500 flex items-center gap-1'>
														<CheckCircle className='size-3' />
														Approved
													</span>
												) : (
													<span className='text-xs text-yellow-500 flex items-center gap-1'>
														<XCircle className='size-3' />
														Pending
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>
		</main>
	);
};

export default ArtistPage;

