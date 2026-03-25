import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/stores/useAdminStore";
import { Heart, Mail, MessageSquare, Users2 } from "lucide-react";
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

const CommunityInsightsTabContent = () => {
	const { communityInsights, isLoading, fetchCommunityInsights } = useAdminStore();

	useEffect(() => {
		void fetchCommunityInsights();
	}, [fetchCommunityInsights]);

	const overview = communityInsights?.overview;
	const subscribers = communityInsights?.subscribers ?? [];
	const topAuthors = communityInsights?.topAuthors ?? [];
	const feedbackItems = communityInsights?.feedback ?? [];

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Subscribers</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.newsletterSubscribers || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-emerald-400/10 p-3 text-emerald-300'>
							<Mail className='h-5 w-5' />
						</div>
					</div>
				</div>
				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Feedback Posts</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.totalFeedback || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-sky-400/10 p-3 text-sky-300'>
							<MessageSquare className='h-5 w-5' />
						</div>
					</div>
				</div>
				<div className='rounded-2xl border border-white/10 bg-zinc-900/70 p-5'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Total Likes</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.totalFeedbackLikes || 0)}
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
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Total Comments</p>
							<p className='mt-3 text-3xl font-semibold text-white'>
								{numberFormatter.format(overview?.totalFeedbackComments || 0)}
							</p>
						</div>
						<div className='rounded-2xl bg-amber-400/10 p-3 text-amber-300'>
							<Users2 className='h-5 w-5' />
						</div>
					</div>
				</div>
			</div>

			<Card className='border-zinc-700/50 bg-zinc-800/50'>
				<CardHeader>
					<CardTitle className='text-white'>Newsletter subscribers</CardTitle>
					<CardDescription>Admin-only list of users currently subscribed to product and release newsletters.</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className='max-h-[420px]'>
						<Table>
							<TableHeader>
								<TableRow className='hover:bg-zinc-800/50'>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Updated</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{subscribers.length ? (
									subscribers.map((subscriber) => (
										<TableRow key={subscriber._id} className='hover:bg-zinc-800/50'>
											<TableCell>
												<div className='flex items-center gap-3'>
													<img src={subscriber.imageUrl} alt={subscriber.fullName} className='h-10 w-10 rounded-xl object-cover' />
													<div>
														<p className='font-medium text-white'>{subscriber.fullName}</p>
														<p className='text-xs text-zinc-500'>{subscriber.clerkId}</p>
													</div>
												</div>
											</TableCell>
											<TableCell className='text-zinc-300'>{subscriber.role || "user"}</TableCell>
											<TableCell className='text-zinc-300'>{formatDate(subscriber.createdAt)}</TableCell>
											<TableCell className='text-zinc-300'>{formatDate(subscriber.updatedAt)}</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className='py-10 text-center text-zinc-500'>
											{isLoading ? "Loading subscribers..." : "No newsletter subscribers found."}
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
					<CardTitle className='text-white'>Feedback by user</CardTitle>
					<CardDescription>Who is posting the most feedback, and how much engagement those posts are getting.</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className='hover:bg-zinc-800/50'>
								<TableHead>User</TableHead>
								<TableHead>Feedbacks</TableHead>
								<TableHead>Total Likes</TableHead>
								<TableHead>Total Comments</TableHead>
								<TableHead>Last Feedback</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{topAuthors.length ? (
								topAuthors.map((item, index) => (
									<TableRow key={`${item.author?._id || "unknown"}-${index}`} className='hover:bg-zinc-800/50'>
										<TableCell>
											<div className='flex items-center gap-3'>
												{item.author?.imageUrl ? (
													<img src={item.author.imageUrl} alt={item.author.fullName} className='h-10 w-10 rounded-xl object-cover' />
												) : (
													<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700 text-white'>?</div>
												)}
												<div>
													<p className='font-medium text-white'>{item.author?.fullName || "Unknown user"}</p>
													<p className='text-xs text-zinc-500'>{item.author?.role || "user"}</p>
												</div>
											</div>
										</TableCell>
										<TableCell className='text-zinc-300'>{numberFormatter.format(item.feedbackCount)}</TableCell>
										<TableCell className='text-zinc-300'>{numberFormatter.format(item.totalLikes)}</TableCell>
										<TableCell className='text-zinc-300'>{numberFormatter.format(item.totalComments)}</TableCell>
										<TableCell className='text-zinc-300'>{formatDate(item.lastFeedbackAt)}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className='py-10 text-center text-zinc-500'>
										{isLoading ? "Loading feedback summary..." : "No feedback activity found."}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className='border-zinc-700/50 bg-zinc-800/50'>
				<CardHeader>
					<CardTitle className='text-white'>Feedback posts</CardTitle>
					<CardDescription>Every feedback item with author, like count, comment count, and linked song or album context.</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className='max-h-[520px]'>
						<Table>
							<TableHeader>
								<TableRow className='hover:bg-zinc-800/50'>
									<TableHead>Author</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Feedback</TableHead>
									<TableHead>Likes</TableHead>
									<TableHead>Comments</TableHead>
									<TableHead>Linked To</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{feedbackItems.length ? (
									feedbackItems.map((item) => {
										const linkedLabel = item.song
											? `${item.song.title} - ${item.song.artist}`
											: item.album
												? `${item.album.title} - ${item.album.artist}`
												: "General";

										return (
										<TableRow key={item._id} className='hover:bg-zinc-800/50'>
											<TableCell>
												<div className='flex items-center gap-3'>
													{item.author?.imageUrl ? (
														<img src={item.author.imageUrl} alt={item.author.fullName} className='h-10 w-10 rounded-xl object-cover' />
													) : (
														<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700 text-white'>?</div>
													)}
													<div>
														<p className='font-medium text-white'>{item.author?.fullName || "Unknown user"}</p>
														<p className='text-xs text-zinc-500'>{item.author?.role || "user"}</p>
													</div>
												</div>
											</TableCell>
											<TableCell className='uppercase text-zinc-300'>{item.category}</TableCell>
											<TableCell className='min-w-[320px] text-zinc-200'>{item.content}</TableCell>
											<TableCell className='text-zinc-300'>{numberFormatter.format(item.likesCount)}</TableCell>
											<TableCell className='text-zinc-300'>{numberFormatter.format(item.commentsCount)}</TableCell>
											<TableCell className='text-zinc-300'>{linkedLabel}</TableCell>
											<TableCell className='text-zinc-300'>{formatDate(item.createdAt)}</TableCell>
										</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={7} className='py-10 text-center text-zinc-500'>
											{isLoading ? "Loading feedback posts..." : "No feedback posts found."}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
};

export default CommunityInsightsTabContent;
