import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/stores/useAdminStore";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { useEffect } from "react";

const PendingAlbumsTable = () => {
	const { pendingAlbums, isLoading, fetchPendingAlbums, approveAlbum, rejectAlbum } = useAdminStore();

	useEffect(() => {
		fetchPendingAlbums();
	}, [fetchPendingAlbums]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading pending albums...</div>
			</div>
		);
	}

	if (pendingAlbums.length === 0) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>No pending albums</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Title</TableHead>
					<TableHead>Artist</TableHead>
					<TableHead>Release Year</TableHead>
					<TableHead>Upload Date</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{pendingAlbums.map((album) => (
					<TableRow key={album._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{album.title}</TableCell>
						<TableCell>{album.artist}</TableCell>
						<TableCell>{album.releaseYear}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{album.createdAt?.split("T")[0] || "N/A"}
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => approveAlbum(album._id)}
									className='text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'
								>
									<CheckCircle className='size-4 mr-1' />
									Approve
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => rejectAlbum(album._id)}
									className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
								>
									<XCircle className='size-4 mr-1' />
									Reject
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default PendingAlbumsTable;

