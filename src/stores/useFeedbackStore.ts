import { axiosInstance } from "@/lib/axios";
import { Feedback } from "@/types";
import { create } from "zustand";
import toast from "react-hot-toast";

interface CreateFeedbackPayload {
	content: string;
	category: "general" | "song" | "album" | "feature";
	songId?: string;
	albumId?: string;
}

interface FeedbackStore {
	feedback: Feedback[];
	isLoading: boolean;
	createFeedbackLoading: boolean;
	fetchFeedback: () => Promise<void>;
	createFeedback: (payload: CreateFeedbackPayload) => Promise<void>;
	toggleLike: (id: string) => Promise<void>;
	addComment: (id: string, content: string) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackStore>((set, get) => ({
	feedback: [],
	isLoading: false,
	createFeedbackLoading: false,

	fetchFeedback: async () => {
		set({ isLoading: true });
		try {
			const response = await axiosInstance.get("/feedback");
			set({ feedback: response.data });
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to load feedback");
		} finally {
			set({ isLoading: false });
		}
	},

	createFeedback: async (payload) => {
		set({ createFeedbackLoading: true });
		try {
			await axiosInstance.post("/feedback", payload);
			await get().fetchFeedback();
			toast.success("Feedback posted");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to post feedback");
			throw error;
		} finally {
			set({ createFeedbackLoading: false });
		}
	},

	toggleLike: async (id) => {
		try {
			await axiosInstance.post(`/feedback/${id}/like`);
			await get().fetchFeedback();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update like");
		}
	},

	addComment: async (id, content) => {
		try {
			await axiosInstance.post(`/feedback/${id}/comments`, { content });
			await get().fetchFeedback();
			toast.success("Comment added");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to add comment");
		}
	},
}));
