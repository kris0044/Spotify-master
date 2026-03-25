import axios from "axios";

const apiBaseURL =
	import.meta.env.VITE_API_URL ||
	(
		import.meta.env.MODE === "development"
			? "http://localhost:5000/api"
			: "https://spotify-master-backend-9di9.onrender.com/api"
	);

export const axiosInstance = axios.create({
	baseURL: apiBaseURL,
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: (() => Promise<string | null>) | null) => {
	tokenGetter = getter;
};

axiosInstance.interceptors.request.use(
	async (config) => {
		if (!tokenGetter) {
			return config;
		}

		try {
			const token = await tokenGetter();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			console.error("Error getting auth token:", error);
		}

		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.log("401 Unauthorized", error.config?.url);
		}
		return Promise.reject(error);
	}
);
