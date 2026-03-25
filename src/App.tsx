import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import NotFoundPage from "./pages/404/NotFoundPage";
import AdminPage from "./pages/admin/AdminPage";
import AlbumPage from "./pages/album/AlbumPage";
import AlbumsPage from "./pages/albums/AlbumsPage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import ArtistPage from "./pages/artist/ArtistPage";
import ChatPage from "./pages/chat/ChatPage";
import CommunityPage from "./pages/community/CommunityPage";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import ListeningHistoryPage from "./pages/history/ListeningHistoryPage";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/login/LoginPage";
import PlaylistDetailPage from "./pages/playlists/PlaylistDetailPage";
import PlaylistsPage from "./pages/playlists/PlaylistsPage";
import AllSongsPage from "./pages/songs/AllSongsPage";
import SongDetailPage from "./pages/songs/SongDetailPage";
import SignUpPage from "./pages/signup/SignUpPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import PublicMusicPage from "./pages/public-music/PublicMusicPage";
import PublicMusicTop100Page from "./pages/public-music/PublicMusicTop100Page";

function App() {
	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl='/auth-callback' />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/login/*' element={<LoginPage />} />
				<Route path='/signup/*' element={<SignUpPage />} />
				<Route path='/admin' element={<AdminPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/albums' element={<AlbumsPage />} />
					<Route path='/songs' element={<AllSongsPage />} />
					<Route path='/songs/:songId' element={<SongDetailPage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/community' element={<CommunityPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='/notifications' element={<NotificationsPage />} />
					<Route path='/publicmusic' element={<PublicMusicPage />} />
					<Route path='/publicmusic/top100' element={<PublicMusicTop100Page />} />
					<Route path='/playlists' element={<PlaylistsPage />} />
					<Route path='/playlists/:id' element={<PlaylistDetailPage />} />
					<Route path='/favorites' element={<FavoritesPage />} />
					<Route path='/history' element={<ListeningHistoryPage />} />
					<Route path='/artist' element={<ArtistPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
