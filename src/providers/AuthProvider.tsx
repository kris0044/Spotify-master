import { setTokenGetter } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId } = useAuth();
	const [loading, setLoading] = useState(true);

	const { checkUserRole } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	useEffect(() => {
		const initAuth = async () => {
			try {
				setTokenGetter(getToken);

				if (userId) {
					await checkUserRole();
					initSocket(userId);
				} else {
					useAuthStore.getState().reset();
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
			} finally {
				setLoading(false);
			}
		};

		void initAuth();

		return () => disconnectSocket();
	}, [getToken, userId, checkUserRole, initSocket, disconnectSocket]);

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
