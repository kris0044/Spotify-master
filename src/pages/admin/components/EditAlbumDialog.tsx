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
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { Pencil, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EditAlbumDialogProps {
	album: Album;
}

const EditAlbumDialog = ({ album }: EditAlbumDialogProps) => {
	const { updateAlbum } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState({
		title: album.title,
		artist: album.artist,
		genre: album.genre || "",
		releaseYear: String(album.releaseYear || ""),
	});

	useEffect(() => {
		if (!open) {
			setForm({
				title: album.title,
				artist: album.artist,
				genre: album.genre || "",
				releaseYear: String(album.releaseYear || ""),
			});
			setImageFile(null);
		}
	}, [album, open]);

	const handleSubmit = async () => {
		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append("title", form.title);
			formData.append("artist", form.artist);
			formData.append("genre", form.genre);
			formData.append("releaseYear", form.releaseYear);

			if (imageFile) {
				formData.append("imageFile", imageFile);
			}

			await updateAlbum(album._id, formData);
			setOpen(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant='ghost' size='sm'>
					<Pencil className='h-4 w-4' />
				</Button>
			</DialogTrigger>

			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Update the album details shown across the app.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						ref={fileInputRef}
						accept='image/*'
						className='hidden'
						onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
								{imageFile ? imageFile.name : "Upload new album artwork (optional)"}
							</div>
							<Button variant='outline' size='sm' className='text-xs'>
								Choose File
							</Button>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title</label>
						<Input
							value={form.title}
							onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={form.artist}
							onChange={(e) => setForm((current) => ({ ...current, artist: e.target.value }))}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Genre</label>
						<Input
							value={form.genre}
							onChange={(e) => setForm((current) => ({ ...current, genre: e.target.value }))}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							min={1900}
							max={new Date().getFullYear()}
							value={form.releaseYear}
							onChange={(e) => setForm((current) => ({ ...current, releaseYear: e.target.value }))}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting || !form.title || !form.artist}>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default EditAlbumDialog;
