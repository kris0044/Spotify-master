import { setTokenGetter } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);

  const { checkAdminStatus } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set up the token getter for axios (this gets called on every request)
        setTokenGetter(getToken);
        console.log("🔐 Token getter configured");

        if (userId) {
          // User is authenticated
          console.log("✅ User authenticated:", userId);
          
          // Check admin status
          try {
            await checkAdminStatus();
            console.log("✅ Admin check completed");
          } catch (error) {
            console.log("ℹ️ Admin check failed (user not admin)");
          }
          
          // Initialize socket
          initSocket(userId);
        } else {
          // User not authenticated
          console.log("⚠️ User not authenticated");
          useAuthStore.getState().reset();
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => disconnectSocket();
  }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;