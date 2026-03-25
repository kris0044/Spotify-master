export interface Song {
	_id: string;
	title: string;
	artist: string;
	genre?: string | null;
	albumId: string | null;
	imageUrl: string;
	audioUrl: string;
	duration: number;
	createdAt: string;
	updatedAt: string;
	playCount?: number;
	totalPlays?: number;
	isApproved?: boolean;
	uploadedBy?: string | User;
	source?: string;
	externalVideoId?: string | null;
	playbackUrl?: string | null;
}

export interface Album {
	createdAt: any;
	_id: string;
	title: string;
	artist: string;
	genre?: string | null;
	imageUrl: string;
	releaseYear: number;
	songs: Song[];
	isApproved?: boolean;
	uploadedBy?: string | User;
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export type AnalyticsRange = "week" | "month" | "year";

export interface AdminAnalyticsPoint {
	label: string;
	value: number;
}

export interface AdminAnalyticsSong {
	title: string;
	artist: string;
	imageUrl: string;
	streams: number;
	listeners: number;
	lastPlayedAt: string;
}

export interface AdminAnalyticsArtist {
	name: string;
	streams: number;
	songCount: number;
}

export interface AdminAnalyticsListener {
	name: string;
	imageUrl?: string;
	streams: number;
	uniqueSongs: number;
	lastPlayedAt: string;
}

export interface AdminAnalytics {
	range: AnalyticsRange;
	window: {
		startDate: string;
		endDate: string;
	};
	overview: {
		totalStreams: number;
		activeListeners: number;
		newSongs: number;
		newAlbums: number;
		pendingSongs: number;
		pendingAlbums: number;
	};
	bestSong: AdminAnalyticsSong | null;
	topSongs: AdminAnalyticsSong[];
	topArtists: AdminAnalyticsArtist[];
	topListeners: AdminAnalyticsListener[];
	playsTimeline: AdminAnalyticsPoint[];
}

export interface AdminUserInsightsOverview {
	totalPlaylists: number;
	activePlaylistCreators: number;
	totalFavoriteActions: number;
	uniqueFavoritedSongs: number;
	avgSongsPerPlaylist: number;
}

export interface AdminUserInsightsOwner {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	role?: "user" | "admin" | "artist";
	createdAt?: string;
}

export interface AdminUserInsightsPlaylistSong {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	duration: number;
	genre?: string | null;
}

export interface AdminUserInsightsPlaylist {
	_id: string;
	name: string;
	description: string;
	userId: string;
	songCount: number;
	totalDuration: number;
	createdAt: string;
	updatedAt: string;
	owner: AdminUserInsightsOwner | null;
	songs: AdminUserInsightsPlaylistSong[];
}

export interface AdminUserInsightsFavoriteSong {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	genre?: string | null;
	source?: string;
	playCount?: number;
	duration: number;
	favoritesCount: number;
	lastFavoritedAt: string;
	uploadedBy?: AdminUserInsightsOwner | null;
}

export interface AdminUserInsights {
	overview: AdminUserInsightsOverview;
	playlists: AdminUserInsightsPlaylist[];
	topFavoritedSongs: AdminUserInsightsFavoriteSong[];
}

export interface AdminCommunitySubscriber {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	role?: "user" | "admin" | "artist";
	createdAt?: string;
	updatedAt?: string;
}

export interface AdminCommunityFeedbackAuthor {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	role?: "user" | "admin" | "artist";
}

export interface AdminCommunityFeedbackItem {
	_id: string;
	content: string;
	category: "general" | "song" | "album" | "feature";
	createdAt: string;
	author: AdminCommunityFeedbackAuthor | null;
	likesCount: number;
	commentsCount: number;
	song?: Pick<Song, "_id" | "title" | "artist" | "imageUrl"> | null;
	album?: Pick<Album, "_id" | "title" | "artist" | "imageUrl"> | null;
}

export interface AdminCommunityAuthorSummary {
	author: AdminCommunityFeedbackAuthor | null;
	feedbackCount: number;
	totalLikes: number;
	totalComments: number;
	lastFeedbackAt: string;
}

export interface AdminCommunityInsightsOverview {
	newsletterSubscribers: number;
	totalFeedback: number;
	totalFeedbackLikes: number;
	totalFeedbackComments: number;
}

export interface AdminCommunityInsights {
	overview: AdminCommunityInsightsOverview;
	subscribers: AdminCommunitySubscriber[];
	feedback: AdminCommunityFeedbackItem[];
	topAuthors: AdminCommunityAuthorSummary[];
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	role?: "user" | "admin" | "artist";
	newsletterSubscribed?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface Playlist {
	_id: string;
	name: string;
	description: string;
	userId: string;
	songs: Song[];
	createdAt: string;
	updatedAt: string;
}

export interface Favorite {
	_id: string;
	userId: string;
	songId: string | Song;
	createdAt: string;
	updatedAt: string;
}

export interface ListeningHistoryItem {
	_id: string;
	playCount: number;
	lastPlayedAt: string;
	song: Song;
}

export interface ListeningHistoryStats {
	totalPlays: number;
	uniqueSongs: number;
	lastPlayedAt: string | null;
}

export interface ArtistDashboardStats {
	totalPlays: number;
	uniqueListeners: number;
	followers: number;
	totalSongs: number;
	topSongs: Song[];
}

export interface RecommendationResponse {
	topArtists: string[];
	topGenres: string[];
	recommendations: Song[];
}

export interface FeedbackComment {
	_id: string;
	user: User;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface Feedback {
	_id: string;
	author: User;
	content: string;
	category: "general" | "song" | "album" | "feature";
	song?: Pick<Song, "_id" | "title" | "artist" | "imageUrl"> | null;
	album?: Pick<Album, "_id" | "title" | "artist" | "imageUrl"> | null;
	likes: string[];
	comments: FeedbackComment[];
	createdAt: string;
	updatedAt: string;
}

export interface Notification {
	_id: string;
	type: "song" | "album" | "feedback" | "system";
	title: string;
	message: string;
	link: string;
	isRead: boolean;
	metadata?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface PublicMusicSong {
	videoId: string;
	title: string;
	artist: string;
	album: string | null;
	duration: number | null;
	thumbnailUrl: string;
	rank?: number | null;
	internalSongId?: string | null;
}

export interface PublicMusicChartResponse {
	scope: "global" | "region";
	region: string | null;
	sourceQuery: string;
	playlist: {
		name: string;
		playlistId: string;
		artist: string;
		thumbnailUrl: string;
	};
	songs: PublicMusicSong[];
}

export interface PublicMusicArtistSpotlight {
	name: string;
	imageUrl: string;
	songs: Song[];
	songCount: number;
	albumCount: number;
}

export interface PublicMusicAlbumSpotlight {
	title: string;
	artist: string;
	imageUrl: string;
	songs: Song[];
}

export interface PublicMusicHomeSections {
	featuredSongs: Song[];
	recommendedSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	artists: PublicMusicArtistSpotlight[];
	albums: PublicMusicAlbumSpotlight[];
}
