import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://spotify-master-backend-9di9.onrender.com/api",
});

// Store the token getter function
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
	tokenGetter = getter;
};

// Add request interceptor to attach token dynamically
axiosInstance.interceptors.request.use(
	async (config) => {
		if (tokenGetter) {
			try {
				const token = await tokenGetter();
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
					console.log("✅ Request has Authorization header");
				} else {
					console.log("⚠️ Request missing Authorization header - no token", config.url);
				}
			} catch (error) {
				console.error("❌ Error getting token:", error);
			}
		} else {
			console.log("⚠️ Token getter not configured", config.url);
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			console.log("❌ 401 Unauthorized");
			// Don't auto-redirect for admin check endpoint
			if (!error.config?.url?.includes('/admin/check')) {
				// Optionally redirect to home/login
				// window.location.href = "/";
			}
		}
		return Promise.reject(error);
	}
);
// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
// const token = 'BQCYLFI-fBirvlexiYfqXb68JtByfjelqq0-opXl51n_awIeN7WR33-BaO-gY1Bv3a65wErbtwMOHddJXfrQ-hDuJAaJMWszpKXC_pdMLXTonKJAzxjnpW20cjjW34YdDYZUhiOHM9DmGKsAHIjTOf5lQjR3NjP9I3lrvjQ_d9VGcQqxdintUaNWoE3MNcdBHP1rBEJVdOtWyDMChbd_LzDOjvAEbxxlYOTJO0jTD7BjiOhu3ZyPV9jsHeLjg8UlDvlLAB2gpgMPZtEaP122HCpKlxry2_-kSx4gjFYrMPKRlarI1LqgfybLMy8AifKZrJFQ';
// async function fetchWebApi(endpoint, method, body) {
//   const res = await fetch(`https://api.spotify.com/${endpoint}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     method,
//     body:JSON.stringify(body)
//   });
//   return await res.json();
// }

// async function getTopTracks(){
//   // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
//   return (await fetchWebApi(
//     'v1/me/top/tracks?time_range=long_term&limit=5', 'GET'
//   )).items;
// }

// const topTracks = await getTopTracks();
// console.log(
//   topTracks?.map(
//     ({name, artists}) =>
//       `${name} by ${artists.map(artist => artist.name).join(', ')}`
//   )
// );
// const playlistId = '3lkq3YavEdKRaouXhPPjkq';

// <iframe
//   title="Spotify Embed: Recommendation Playlist "
//   src={`https://open.spotify.com/embed/playlist/3lkq3YavEdKRaouXhPPjkq?utm_source=generator&theme=0`}
//   width="100%"
//   height="100%"
//   style={{ minHeight: '360px' }}
//   frameBorder="0"
//   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
//   loading="lazy"
// />
