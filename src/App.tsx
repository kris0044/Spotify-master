import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import PlaylistsPage from "./pages/playlists/PlaylistsPage";
import PlaylistDetailPage from "./pages/playlists/PlaylistDetailPage";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import ArtistPage from "./pages/artist/ArtistPage";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";
import AllSongsPage from "./pages/songs/AllSongsPage";
import SignUpPage from "./pages/signup/SignUpPage";
import LoginPage from "./pages/login/LoginPage";

function App() {
  return (
    <>
      <Routes>
  <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl="/auth-callback" />} />
  
  <Route path="/auth-callback" element={<AuthCallbackPage />} />

  {/* ✅ Fixed Login & Signup routes */}
  <Route path="/login/*" element={<LoginPage />} />
  <Route path="/signup/*" element={<SignUpPage />} />

  <Route path="/admin" element={<AdminPage />} />

  <Route element={<MainLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/songs" element={<AllSongsPage />} />
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/albums/:albumId" element={<AlbumPage />} />
    <Route path="/playlists" element={<PlaylistsPage />} />
    <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/artist" element={<ArtistPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
      <Toaster />
    </>
  );
}

export default App;
