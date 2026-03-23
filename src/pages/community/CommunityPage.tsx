import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { Heart, MessageSquare, Radio, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const categories = [
	{ value: "general", label: "General" },
	{ value: "song", label: "Song" },
	{ value: "album", label: "Album" },
	{ value: "feature", label: "Feature" },
] as const;

const CommunityPage = () => {
	const { feedback, isLoading, fetchFeedback, createFeedback, createFeedbackLoading, toggleLike, addComment } =
		useFeedbackStore();
	const { songs, albums, fetchSongs, fetchAlbums } = useMusicStore();
	const { user } = useAuthStore();

	const [content, setContent] = useState("");
	const [category, setCategory] = useState<(typeof categories)[number]["value"]>("general");
	const [songId, setSongId] = useState("");
	const [albumId, setAlbumId] = useState("");
	const [newsletterLoading, setNewsletterLoading] = useState(false);
	const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

	useEffect(() => {
		fetchFeedback();
		fetchSongs();
		fetchAlbums();
	}, [fetchFeedback, fetchSongs, fetchAlbums]);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		await createFeedback({
			content,
			category,
			songId: category === "song" ? songId : undefined,
			albumId: category === "album" ? albumId : undefined,
		});
		setContent("");
		setSongId("");
		setAlbumId("");
		setCategory("general");
	};

	const handleNewsletterToggle = async () => {
		setNewsletterLoading(true);
		try {
			const response = await axiosInstance.post("/users/me/newsletter");
			useAuthStore.setState((state) => ({
				user: state.user ? { ...state.user, newsletterSubscribed: response.data.newsletterSubscribed } : state.user,
			}));
			toast.success(
				response.data.newsletterSubscribed ? "Newsletter enabled" : "Newsletter disabled"
			);
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update newsletter");
		} finally {
			setNewsletterLoading(false);
		}
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6'>
					<Card className='border-zinc-800 bg-zinc-900/80'>
						<CardHeader className='flex flex-row items-start justify-between gap-4'>
							<div>
								<CardTitle className='text-2xl'>Community Feedback</CardTitle>
								<p className='mt-2 text-sm text-zinc-400'>
									Share product ideas, react to songs and albums, and track what other listeners want next.
								</p>
							</div>
							<Button
								onClick={handleNewsletterToggle}
								disabled={!user || newsletterLoading}
								className='bg-emerald-500 text-black hover:bg-emerald-400'
							>
								<Radio className='mr-2 h-4 w-4' />
								{user?.newsletterSubscribed ? "Newsletter On" : "Enable Newsletter"}
							</Button>
						</CardHeader>
						<CardContent>
							<form className='space-y-4' onSubmit={handleSubmit}>
								<textarea
									value={content}
									onChange={(event) => setContent(event.target.value)}
									placeholder='What should change in the app, music flow, or community experience?'
									className='min-h-28 w-full rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none'
								/>
								<div className='grid gap-3 md:grid-cols-3'>
									<select
										value={category}
										onChange={(event) => setCategory(event.target.value as typeof category)}
										className='rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white'
									>
										{categories.map((item) => (
											<option key={item.value} value={item.value}>
												{item.label}
											</option>
										))}
									</select>
									<select
										value={songId}
										onChange={(event) => setSongId(event.target.value)}
										disabled={category !== "song"}
										className='rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white disabled:opacity-50'
									>
										<option value=''>Link a song</option>
										{songs.map((song) => (
											<option key={song._id} value={song._id}>
												{song.title} - {song.artist}
											</option>
										))}
									</select>
									<select
										value={albumId}
										onChange={(event) => setAlbumId(event.target.value)}
										disabled={category !== "album"}
										className='rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white disabled:opacity-50'
									>
										<option value=''>Link an album</option>
										{albums.map((album) => (
											<option key={album._id} value={album._id}>
												{album.title} - {album.artist}
											</option>
										))}
									</select>
								</div>
								<Button
									type='submit'
									disabled={!user || !content.trim() || createFeedbackLoading}
									className='bg-white text-black hover:bg-zinc-200'
								>
									<Send className='mr-2 h-4 w-4' />
									{createFeedbackLoading ? "Posting..." : "Post Feedback"}
								</Button>
							</form>
						</CardContent>
					</Card>

					<div className='space-y-4'>
						{feedback.map((item) => {
							const commentValue = commentDrafts[item._id] || "";
							const likedByMe = Boolean(user?._id && item.likes.includes(user._id));

							return (
								<Card key={item._id} className='border-zinc-800 bg-zinc-950/90'>
									<CardContent className='space-y-4 p-5'>
										<div className='flex items-start justify-between gap-4'>
											<div className='flex items-center gap-3'>
												<img
													src={item.author.imageUrl}
													alt={item.author.fullName}
													className='h-11 w-11 rounded-full object-cover'
												/>
												<div>
													<div className='font-medium text-white'>{item.author.fullName}</div>
													<div className='text-xs uppercase tracking-[0.25em] text-zinc-500'>
														{item.category}
													</div>
												</div>
											</div>
											<div className='text-xs text-zinc-500'>{new Date(item.createdAt).toLocaleString()}</div>
										</div>

										<p className='text-sm leading-6 text-zinc-100'>{item.content}</p>

										{item.song && (
											<div className='rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300'>
												Linked song: <span className='text-white'>{item.song.title}</span> by {item.song.artist}
											</div>
										)}
										{item.album && (
											<div className='rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300'>
												Linked album: <span className='text-white'>{item.album.title}</span> by {item.album.artist}
											</div>
										)}

										<div className='flex items-center gap-3'>
											<Button
												variant='outline'
												onClick={() => toggleLike(item._id)}
												disabled={!user}
												className='border-zinc-700 bg-transparent text-zinc-100'
											>
												<Heart className={`mr-2 h-4 w-4 ${likedByMe ? "fill-current text-rose-400" : ""}`} />
												{item.likes.length}
											</Button>
											<div className='flex items-center text-sm text-zinc-400'>
												<MessageSquare className='mr-2 h-4 w-4' />
												{item.comments.length} comments
											</div>
										</div>

										<div className='space-y-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-4'>
											{item.comments.map((comment) => (
												<div key={comment._id} className='flex gap-3'>
													<img
														src={comment.user.imageUrl}
														alt={comment.user.fullName}
														className='h-8 w-8 rounded-full object-cover'
													/>
													<div>
														<div className='text-sm font-medium text-white'>{comment.user.fullName}</div>
														<p className='text-sm text-zinc-300'>{comment.content}</p>
													</div>
												</div>
											))}
											<div className='flex gap-2'>
												<Input
													value={commentValue}
													onChange={(event) =>
														setCommentDrafts((state) => ({ ...state, [item._id]: event.target.value }))
													}
													placeholder='Add a comment'
													className='border-zinc-800 bg-zinc-950'
												/>
												<Button
													onClick={async () => {
														await addComment(item._id, commentValue);
														setCommentDrafts((state) => ({ ...state, [item._id]: "" }));
													}}
													disabled={!user || !commentValue.trim()}
												>
													Send
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}

						{!isLoading && feedback.length === 0 && (
							<Card className='border-zinc-800 bg-zinc-950/70'>
								<CardContent className='p-8 text-center text-zinc-400'>
									No feedback yet. Seed the community by posting the first suggestion.
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</ScrollArea>
		</main>
	);
};

export default CommunityPage;
