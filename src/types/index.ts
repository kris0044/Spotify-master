export interface Song {
	_id: string;
	title: string;
	artist: string;
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
}

export interface Album {
	createdAt: any;
	_id: string;
	title: string;
	artist: string;
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
