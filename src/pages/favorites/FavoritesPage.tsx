import { useEffect } from "react";
import { useFavoriteStore } from "@/stores/useFavoriteStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import Topbar from "@/components/Topbar";
import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionGrid from "@/pages/home/components/SectionGrid";

const FavoritesPage = () => {
	const { favorites, fetchFavorites, isLoading } = useFavoriteStore();
	const { playAlbum } = usePlayerStore();

	useEffect(() => {
		fetchFavorites();
	}, [fetchFavorites]);

	const handlePlayFavorites = () => {
		if (favorites.length > 0) {
			playAlbum(favorites, 0);
		}
	};

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='p-4 sm:p-6'>
					<div className='flex items-center justify-between mb-6'>
						<div>
							<h1 className='text-2xl sm:text-3xl font-bold mb-2'>Your Favorites</h1>
							<p className='text-zinc-400'>
								{favorites.length} {favorites.length === 1 ? "song" : "songs"} you love
							</p>
						</div>
						<Button onClick={handlePlayFavorites} disabled={favorites.length === 0}>
							<Play className='mr-2 size-4' />
							Play All
						</Button>
					</div>

					{isLoading ? (
						<div className='text-center py-8'>Loading favorites...</div>
					) : favorites.length === 0 ? (
						<div className='text-center py-8 text-zinc-400'>
							<Heart className='size-16 mx-auto mb-4 opacity-50' />
							<p>You don't have any favorite songs yet.</p>
							<p className='text-sm mt-2'>Start adding songs to your favorites!</p>
						</div>
					) : (
						<SectionGrid title='' songs={favorites} isLoading={false} />
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default FavoritesPage;

