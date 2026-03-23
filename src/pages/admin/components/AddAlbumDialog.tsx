import { Button } from "@/components/ui/button";
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
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface AlbumSongDraft {
	title: string;
	artist: string;
	genre: string;
	duration: string;
	audioFile: File | null;
	imageFile: File | null;
}

const AddAlbumDialog = () => {
	const { fetchAlbums, fetchSongs } = useMusicStore();
	const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [newAlbum, setNewAlbum] = useState({
		title: "",
		artist: "",
		genre: "",
		releaseYear: new Date().getFullYear(),
	});

	const [imageFile, setImageFile] = useState<File | null>(null);
	const [songs, setSongs] = useState<AlbumSongDraft[]>([
		{ title: "", artist: "", genre: "", duration: "0", audioFile: null, imageFile: null },
	]);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
		}
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			if (!imageFile) {
				return toast.error("Please upload an image");
			}

			const formData = new FormData();
			formData.append("title", newAlbum.title);
			formData.append("artist", newAlbum.artist);
			formData.append("genre", newAlbum.genre);
			formData.append("releaseYear", newAlbum.releaseYear.toString());
			formData.append("imageFile", imageFile);
			formData.append(
				"songs",
				JSON.stringify(
					songs
						.filter((song) => song.title.trim() && song.audioFile)
						.map((song) => ({
							title: song.title,
							artist: song.artist || newAlbum.artist,
							genre: song.genre || newAlbum.genre,
							duration: song.duration,
						}))
				)
			);

			songs
				.filter((song) => song.title.trim() && song.audioFile)
				.forEach((song, index) => {
					if (song.audioFile) {
						formData.append(`audioFile_${index}`, song.audioFile);
					}
					if (song.imageFile) {
						formData.append(`imageFile_${index}`, song.imageFile);
					}
				});

			await axiosInstance.post("/admin/albums", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setNewAlbum({
				title: "",
				artist: "",
				genre: "",
				releaseYear: new Date().getFullYear(),
			});
			setImageFile(null);
			setSongs([{ title: "", artist: "", genre: "", duration: "0", audioFile: null, imageFile: null }]);
			setAlbumDialogOpen(false);
			toast.success("Album created successfully");
			fetchAlbums();
			fetchSongs();
		} catch (error: any) {
			toast.error("Failed to create album: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
			<DialogTrigger asChild>
				<Button className='bg-violet-500 hover:bg-violet-600 text-white'>
					<Plus className='mr-2 h-4 w-4' />
					Add Album
				</Button>
			</DialogTrigger>
			<DialogContent className='bg-zinc-900 border-zinc-700 max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Add New Album</DialogTitle>
					<DialogDescription>Add a new album to your collection</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2'>
					<input
						type='file'
						ref={fileInputRef}
						onChange={handleImageSelect}
						accept='image/*'
						className='hidden'
					/>
					<div
						className='flex items-center justify-center p-6 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer'
						onClick={() => fileInputRef.current?.click()}
					>
						<div className='text-center'>
							<div className='p-3 bg-zinc-800 rounded-full inline-block mb-2'>
								<Upload className='h-6 w-6 text-zinc-400' />
							</div>
							<div className='text-sm text-zinc-400 mb-2'>
								{imageFile ? imageFile.name : "Upload album artwork"}
							</div>
							<Button variant='outline' size='sm' className='text-xs'>
								Choose File
							</Button>
						</div>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title</label>
						<Input
							value={newAlbum.title}
							onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter album title'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={newAlbum.artist}
							onChange={(e) => setNewAlbum({ ...newAlbum, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter artist name'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Genre</label>
						<Input
							value={newAlbum.genre}
							onChange={(e) => setNewAlbum({ ...newAlbum, genre: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter album genre'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							value={newAlbum.releaseYear}
							onChange={(e) => setNewAlbum({ ...newAlbum, releaseYear: parseInt(e.target.value) })}
							className='bg-zinc-800 border-zinc-700'
							placeholder='Enter release year'
							min={1900}
							max={new Date().getFullYear()}
						/>
					</div>
					<div className='space-y-3 rounded-lg border border-zinc-800 p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<div className='text-sm font-medium'>Album Songs</div>
								<div className='text-xs text-zinc-400'>Upload multiple tracks in the same album publish.</div>
							</div>
							<Button
								type='button'
								variant='outline'
								onClick={() =>
									setSongs((current) => [
										...current,
										{ title: "", artist: newAlbum.artist, genre: newAlbum.genre, duration: "0", audioFile: null, imageFile: null },
									])
								}
							>
								Add Track
							</Button>
						</div>
						{songs.map((song, index) => (
							<div key={index} className='space-y-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3'>
								<div className='grid gap-3 md:grid-cols-4'>
									<Input
										value={song.title}
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, title: e.target.value } : item
												)
											)
										}
										className='bg-zinc-800 border-zinc-700'
										placeholder='Track title'
									/>
									<Input
										value={song.artist}
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, artist: e.target.value } : item
												)
											)
										}
										className='bg-zinc-800 border-zinc-700'
										placeholder='Artist'
									/>
									<Input
										value={song.genre}
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, genre: e.target.value } : item
												)
											)
										}
										className='bg-zinc-800 border-zinc-700'
										placeholder='Genre'
									/>
									<Input
										type='number'
										value={song.duration}
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, duration: e.target.value } : item
												)
											)
										}
										className='bg-zinc-800 border-zinc-700'
										placeholder='Duration in seconds'
									/>
								</div>
								<div className='grid gap-3 md:grid-cols-2'>
									<Input
										type='file'
										accept='audio/*'
										className='bg-zinc-800 border-zinc-700'
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, audioFile: e.target.files?.[0] || null } : item
												)
											)
										}
									/>
									<Input
										type='file'
										accept='image/*'
										className='bg-zinc-800 border-zinc-700'
										onChange={(e) =>
											setSongs((current) =>
												current.map((item, currentIndex) =>
													currentIndex === index ? { ...item, imageFile: e.target.files?.[0] || null } : item
												)
											)
										}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={() => setAlbumDialogOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						className='bg-violet-500 hover:bg-violet-600'
						disabled={isLoading || !imageFile || !newAlbum.title || !newAlbum.artist}
					>
						{isLoading ? "Creating..." : "Add Album"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default AddAlbumDialog;
