import { usePlayerStore, getPlaybackType } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const hasTrackedPlay = useRef<boolean>(false);

	const {
		currentSong,
		isPlaying,
		playNext,
		playPrevious,
		setPlaybackProgress,
		resetPlaybackProgress,
		playbackPosition,
		playbackDuration,
	} = usePlayerStore();

	// handle play/pause logic
	useEffect(() => {
		if (getPlaybackType(currentSong) !== "local") {
			audioRef.current?.pause();
			resetPlaybackProgress(currentSong?.duration || 0);
			return;
		}

		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [currentSong, isPlaying]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			resetPlaybackProgress();
			void playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong || getPlaybackType(currentSong) !== "local") {
			if (audioRef.current) {
				audioRef.current.removeAttribute("src");
				audioRef.current.load();
			}
			return;
		}

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;
			hasTrackedPlay.current = false;
			resetPlaybackProgress(currentSong.duration || 0);

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) audio.play();
		}
	}, [currentSong, isPlaying]);

	// Track play count when song starts playing
	useEffect(() => {
		if (!currentSong || !isPlaying || hasTrackedPlay.current || getPlaybackType(currentSong) !== "local") return;

		const audio = audioRef.current;
		if (!audio) return;

		const handlePlay = () => {
			if (!hasTrackedPlay.current && currentSong._id) {
				hasTrackedPlay.current = true;
				// Increment play count
				axiosInstance.post(`/songs/${currentSong._id}/play`).catch((error) => {
					console.error("Failed to track play count:", error);
				});
			}
		};

		audio.addEventListener("play", handlePlay);

		return () => {
			audio.removeEventListener("play", handlePlay);
		};
	}, [currentSong, isPlaying]);

	useEffect(() => {
		if (getPlaybackType(currentSong) !== "local") {
			return;
		}

		const audio = audioRef.current;
		if (!audio) return;

		const updateProgress = () => {
			setPlaybackProgress(audio.currentTime, Number.isFinite(audio.duration) ? audio.duration : currentSong?.duration || 0);
		};

		audio.addEventListener("timeupdate", updateProgress);
		audio.addEventListener("loadedmetadata", updateProgress);
		audio.addEventListener("durationchange", updateProgress);

		updateProgress();

		return () => {
			audio.removeEventListener("timeupdate", updateProgress);
			audio.removeEventListener("loadedmetadata", updateProgress);
			audio.removeEventListener("durationchange", updateProgress);
		};
	}, [currentSong, setPlaybackProgress]);

	useEffect(() => {
		if (!("mediaSession" in navigator)) {
			return;
		}

		if (!currentSong) {
			navigator.mediaSession.metadata = null;
			navigator.mediaSession.playbackState = "none";
			return;
		}

		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentSong.title,
			artist: currentSong.artist,
			album: currentSong.albumId || "",
			artwork: currentSong.imageUrl
				? [
					{ src: currentSong.imageUrl, sizes: "96x96", type: "image/png" },
					{ src: currentSong.imageUrl, sizes: "128x128", type: "image/png" },
					{ src: currentSong.imageUrl, sizes: "192x192", type: "image/png" },
					{ src: currentSong.imageUrl, sizes: "256x256", type: "image/png" },
					{ src: currentSong.imageUrl, sizes: "384x384", type: "image/png" },
					{ src: currentSong.imageUrl, sizes: "512x512", type: "image/png" },
				]
				: [],
		});
		navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

		navigator.mediaSession.setActionHandler("play", () => {
			if (!usePlayerStore.getState().isPlaying) {
				usePlayerStore.getState().togglePlay();
			}
		});
		navigator.mediaSession.setActionHandler("pause", () => {
			if (usePlayerStore.getState().isPlaying) {
				usePlayerStore.getState().togglePlay();
			}
		});
		navigator.mediaSession.setActionHandler("nexttrack", () => {
			void usePlayerStore.getState().playNext();
		});
		navigator.mediaSession.setActionHandler("previoustrack", () => {
			usePlayerStore.getState().playPrevious();
		});
		navigator.mediaSession.setActionHandler("seekto", (details) => {
			const seekTime = details.seekTime ?? 0;
			const currentPlayerSong = usePlayerStore.getState().currentSong;
			if (!currentPlayerSong) return;

			if (getPlaybackType(currentPlayerSong) === "local" && audioRef.current) {
				audioRef.current.currentTime = seekTime;
				usePlayerStore.getState().setPlaybackProgress(
					seekTime,
					Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : currentPlayerSong.duration || 0
				);
				return;
			}

			usePlayerStore.getState().requestSeek(seekTime);
		});

		return () => {
			navigator.mediaSession.setActionHandler("play", null);
			navigator.mediaSession.setActionHandler("pause", null);
			navigator.mediaSession.setActionHandler("nexttrack", null);
			navigator.mediaSession.setActionHandler("previoustrack", null);
			navigator.mediaSession.setActionHandler("seekto", null);
		};
	}, [currentSong, isPlaying, playNext, playPrevious]);

	useEffect(() => {
		if (!("mediaSession" in navigator) || !currentSong) {
			return;
		}

		try {
			navigator.mediaSession.setPositionState({
				duration: Math.max(playbackDuration || currentSong.duration || 0, 0),
				playbackRate: 1,
				position: Math.max(playbackPosition || 0, 0),
			});
		} catch {
			// Some browsers reject position state updates for unsupported sources or missing duration.
		}
	}, [currentSong, playbackDuration, playbackPosition]);

	return <audio ref={audioRef} preload='metadata' playsInline />;
};
export default AudioPlayer;
