import { usePlayerStore } from "@/stores/usePlayerStore";
import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const hasTrackedPlay = useRef<boolean>(false);

	const { currentSong, isPlaying, playNext } = usePlayerStore();

	// handle play/pause logic
	useEffect(() => {
		if (isPlaying) audioRef.current?.play();
		else audioRef.current?.pause();
	}, [isPlaying]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;
			hasTrackedPlay.current = false;

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) audio.play();
		}
	}, [currentSong, isPlaying]);

	// Track play count when song starts playing
	useEffect(() => {
		if (!currentSong || !isPlaying || hasTrackedPlay.current) return;

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

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
