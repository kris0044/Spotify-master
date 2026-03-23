import { setTokenGetter } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId, isLoaded, isSignedIn } = useAuth();
	const [loading, setLoading] = useState(true);

	const { checkUserRole } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();
	const { fetchNotifications, bindSocket, reset: resetNotifications } = useNotificationStore();
	const { fetchUpNextQueue, resetQueueState } = usePlayerStore();

	useEffect(() => {
		if (!isLoaded) {
			return;
		}

		let cancelled = false;

		const initAuth = async () => {
			try {
				setTokenGetter(() => (isSignedIn ? getToken() : Promise.resolve(null)));

				if (isSignedIn && userId) {
					try {
						await checkUserRole();
					} catch {
						await wait(400);
						if (!cancelled) {
							await checkUserRole();
						}
					}

					if (cancelled) {
						return;
					}

					initSocket(userId);
					bindSocket();
					await fetchNotifications();
					await fetchUpNextQueue();
				} else {
					useAuthStore.getState().reset();
					resetNotifications();
					resetQueueState();
					setTokenGetter(null);
					disconnectSocket();
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		setLoading(true);
		void initAuth();

		return () => {
			cancelled = true;
			disconnectSocket();
		};
	}, [isLoaded, isSignedIn, getToken, userId, checkUserRole, initSocket, disconnectSocket, fetchNotifications, bindSocket, resetNotifications, fetchUpNextQueue, resetQueueState]);

	if (loading) {
		return (
			<div className='h-screen w-full flex items-center justify-center'>
				<Loader className='size-8 text-emerald-500 animate-spin' />
			</div>
		);
	}

	return <>{children}</>;
};

export default AuthProvider;
