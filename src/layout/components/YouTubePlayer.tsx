import { axiosInstance } from "@/lib/axios";
import { ensureResolvableSong } from "@/lib/ytMusic";
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
				getCurrentTime: () => number;
				getDuration: () => number;
				seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
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
	getCurrentTime: () => number;
	getDuration: () => number;
	seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
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
	const progressIntervalRef = useRef<number | null>(null);
	const trackedVideoIdRef = useRef<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const { currentSong, isPlaying, playNext, setPlaybackProgress, resetPlaybackProgress, pendingSeekTime, clearPendingSeek } =
		usePlayerStore();

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
		if (trackedVideoIdRef.current !== activeVideoId) {
			trackedVideoIdRef.current = null;
		}
	}, [activeVideoId]);

	useEffect(() => {
		if (!currentSong || !activeVideoId || !isPlaying || getPlaybackType(currentSong) !== "youtube") {
			return;
		}

		if (trackedVideoIdRef.current === activeVideoId) {
			return;
		}

		trackedVideoIdRef.current = activeVideoId;

		void (async () => {
			try {
				const resolvedSong = await ensureResolvableSong(currentSong);
				await axiosInstance.post(`/songs/${resolvedSong._id}/play`);
			} catch (error) {
				trackedVideoIdRef.current = null;
				console.error("Failed to track YouTube play count:", error);
			}
		})();
	}, [activeVideoId, currentSong, isPlaying]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !isReady) return;

		if (!activeVideoId) {
			player.stopVideo();
			lastVideoIdRef.current = null;
			resetPlaybackProgress();
			return;
		}

		if (lastVideoIdRef.current !== activeVideoId) {
			lastVideoIdRef.current = activeVideoId;
			resetPlaybackProgress(currentSong?.duration || 0);
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
	}, [activeVideoId, currentSong?.duration, isPlaying, isReady, resetPlaybackProgress]);

	useEffect(() => {
		if (progressIntervalRef.current) {
			window.clearInterval(progressIntervalRef.current);
			progressIntervalRef.current = null;
		}

		if (!isReady || !isPlaying || !activeVideoId || getPlaybackType(currentSong) !== "youtube") {
			return;
		}

		const syncProgress = () => {
			const player = playerRef.current;
			if (!player) return;

			const position = player.getCurrentTime();
			const duration = player.getDuration() || currentSong?.duration || 0;
			setPlaybackProgress(position, duration);
		};

		syncProgress();
		progressIntervalRef.current = window.setInterval(syncProgress, 500);

		return () => {
			if (progressIntervalRef.current) {
				window.clearInterval(progressIntervalRef.current);
				progressIntervalRef.current = null;
			}
		};
	}, [activeVideoId, currentSong, isPlaying, isReady, setPlaybackProgress]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !isReady || pendingSeekTime === null || getPlaybackType(currentSong) !== "youtube") {
			return;
		}

		player.seekTo(pendingSeekTime, true);
		setPlaybackProgress(pendingSeekTime, player.getDuration() || currentSong?.duration || 0);
		clearPendingSeek();
	}, [clearPendingSeek, currentSong, isReady, pendingSeekTime, setPlaybackProgress]);

	return <div ref={containerRef} className='fixed left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden' aria-hidden='true' />;
};

export default YouTubePlayer;
