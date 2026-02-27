import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/stores/useAdminStore";
import { CheckCircle, XCircle, Calendar } from "lucide-react";
import { useEffect } from "react";

const PendingSongsTable = () => {
	const { pendingSongs, isLoading, fetchPendingSongs, approveSong, rejectSong } = useAdminStore();

	useEffect(() => {
		fetchPendingSongs();
	}, [fetchPendingSongs]);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading pending songs...</div>
			</div>
		);
	}

	if (pendingSongs.length === 0) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>No pending songs</div>
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
					<TableHead>Upload Date</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{pendingSongs.map((song) => (
					<TableRow key={song._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{song.title}</TableCell>
						<TableCell>{song.artist}</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{song.createdAt.split("T")[0]}
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => approveSong(song._id)}
									className='text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'
								>
									<CheckCircle className='size-4 mr-1' />
									Approve
								</Button>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => rejectSong(song._id)}
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

export default PendingSongsTable;

