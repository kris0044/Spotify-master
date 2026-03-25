import { usePlayerStore, getPlaybackType } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const hasTrackedPlay = useRef<boolean>(false);

	const { currentSong, isPlaying, playNext, setPlaybackProgress, resetPlaybackProgress } = usePlayerStore();

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

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
