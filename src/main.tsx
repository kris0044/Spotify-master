import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./providers/AuthProvider.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
	throw new Error("Missing Publishable Key");
}

const renderApp = () => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
				<AuthProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</AuthProvider>
			</ClerkProvider>
		</StrictMode>
	);
};

// This app does not use a service worker; aggressively remove stale workers once.
if ("serviceWorker" in navigator) {
	const cleanupKey = "sw_cleanup_done_v1";
	const didCleanup = sessionStorage.getItem(cleanupKey) === "true";

	if (!didCleanup) {
		(async () => {
			const registrations = await navigator.serviceWorker.getRegistrations();
			await Promise.all(registrations.map((registration) => registration.unregister()));

			if ("caches" in window) {
				const cacheKeys = await caches.keys();
				await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
			}

			sessionStorage.setItem(cleanupKey, "true");

			// Ensure page is no longer controlled by an old worker before API calls fire.
			if (navigator.serviceWorker.controller || registrations.length > 0) {
				window.location.reload();
				return;
			}

			renderApp();
		})().catch(() => {
			renderApp();
		});
	} else {
		renderApp();
	}
} else {
	renderApp();
}
