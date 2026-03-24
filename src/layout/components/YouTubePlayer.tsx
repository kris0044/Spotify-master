import { usePlayerStore, getPlaybackType } from "@/stores/usePlayerStore";
import { useEffect, useMemo, useRef, useState } from "react";

declare global {
	interface Window {
		YT?: {
			Player: new (
				element: HTMLElement | string,
				config: {
					height?: string;
					width?: string;
					videoId?: string;
					events?: {
						onReady?: () => void;
						onStateChange?: (event: { data: number }) => void;
					};
				}
			) => {
				loadVideoById: (videoId: string) => void;
				cueVideoById: (videoId: string) => void;
				playVideo: () => void;
				pauseVideo: () => void;
				stopVideo: () => void;
			};
			PlayerState: {
				ENDED: number;
			};
		};
		onYouTubeIframeAPIReady?: () => void;
	}
}

const YOUTUBE_API_URL = "https://www.youtube.com/iframe_api";

type YouTubePlayerInstance = {
	loadVideoById: (videoId: string) => void;
	cueVideoById: (videoId: string) => void;
	playVideo: () => void;
	pauseVideo: () => void;
	stopVideo: () => void;
};

const getVideoId = (urlOrId: string | null | undefined) => {
	if (!urlOrId) return null;
	if (!urlOrId.includes("youtube")) return urlOrId;

	try {
		const url = new URL(urlOrId);
		return url.searchParams.get("v");
	} catch {
		return null;
	}
};

const YouTubePlayer = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const playerRef = useRef<YouTubePlayerInstance | null>(null);
	const lastVideoIdRef = useRef<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const { currentSong, isPlaying, playNext } = usePlayerStore();

	const activeVideoId = useMemo(() => {
		if (getPlaybackType(currentSong) !== "youtube") return null;
		return currentSong?.externalVideoId || getVideoId(currentSong?.playbackUrl || currentSong?.audioUrl);
	}, [currentSong]);

	useEffect(() => {
		if (window.YT?.Player || document.querySelector(`script[src="${YOUTUBE_API_URL}"]`)) {
			return;
		}

		const script = document.createElement("script");
		script.src = YOUTUBE_API_URL;
		script.async = true;
		document.body.appendChild(script);
	}, []);

	useEffect(() => {
		const initializePlayer = () => {
			if (!window.YT?.Player || !containerRef.current || playerRef.current) return;

			playerRef.current = new window.YT.Player(containerRef.current, {
				height: "0",
				width: "0",
				events: {
					onReady: () => {
						setIsReady(true);
					},
					onStateChange: (event) => {
						if (event.data === window.YT?.PlayerState.ENDED) {
							void playNext();
						}
					},
				},
			});
		};

		if (window.YT?.Player) {
			initializePlayer();
			return;
		}

		const previousReady = window.onYouTubeIframeAPIReady;
		window.onYouTubeIframeAPIReady = () => {
			previousReady?.();
			initializePlayer();
		};

		return () => {
			window.onYouTubeIframeAPIReady = previousReady;
		};
	}, [playNext]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !isReady) return;

		if (!activeVideoId) {
			player.stopVideo();
			lastVideoIdRef.current = null;
			return;
		}

		if (lastVideoIdRef.current !== activeVideoId) {
			lastVideoIdRef.current = activeVideoId;
			if (isPlaying) {
				player.loadVideoById(activeVideoId);
			} else {
				player.cueVideoById(activeVideoId);
			}
			return;
		}

		if (isPlaying) {
			player.playVideo();
		} else {
			player.pauseVideo();
		}
	}, [activeVideoId, isPlaying, isReady]);

	return <div ref={containerRef} className='fixed left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden' aria-hidden='true' />;
};

export default YouTubePlayer;
