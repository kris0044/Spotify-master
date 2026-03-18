const HistoryListSkeleton = () => {
	return (
		<div className='space-y-3'>
			{Array.from({ length: 8 }).map((_, index) => (
				<div key={index} className='flex items-center gap-3 rounded-md bg-zinc-800/50 p-3 animate-pulse'>
					<div className='size-12 rounded bg-zinc-700 shrink-0' />
					<div className='flex-1 min-w-0'>
						<div className='h-4 w-1/2 rounded bg-zinc-700 mb-2' />
						<div className='h-3 w-1/3 rounded bg-zinc-700' />
					</div>
					<div className='h-4 w-14 rounded bg-zinc-700' />
				</div>
			))}
		</div>
	);
};

export default HistoryListSkeleton;
