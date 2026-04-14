import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar, { MobileBottomNav } from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import YouTubePlayer from "./components/YouTubePlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MainLayout = () => {
	const [isMobile, setIsMobile] = useState(false);
	const location = useLocation();
	const isPublicMusicPage = location.pathname.startsWith("/publicmusic");

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return (
		<div className='h-screen bg-black text-white flex flex-col'>
			<AudioPlayer />
			<YouTubePlayer />

			{isMobile ? (
				<div className='flex-1 overflow-hidden p-1.5'>
					<div className='h-full overflow-hidden rounded-xl'>
						<Outlet />
					</div>
				</div>
			) : (
				<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-1.5 sm:p-2'>
					<ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
						<LeftSidebar />
					</ResizablePanel>

					<ResizableHandle className='hidden md:block w-2 bg-black rounded-lg transition-colors' />

					<ResizablePanel defaultSize={60} minSize={40}>
						<Outlet />
					</ResizablePanel>

					<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

					<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
						<FriendsActivity />
					</ResizablePanel>
				</ResizablePanelGroup>
			)}

			{!isPublicMusicPage && <PlaybackControls />}
			{isMobile && <MobileBottomNav />}
		</div>
	);
};
export default MainLayout;
