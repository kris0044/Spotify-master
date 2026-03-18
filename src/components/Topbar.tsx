import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	const location = useLocation();
	const isAuthPage = location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");

	return (
		<div className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
			<Link to='/' className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				Spotify
			</Link>
			<div className='flex items-center gap-3'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4 mr-2' />
						Admin Dashboard
					</Link>
				)}

				<SignedOut>
					{!isAuthPage && (
						<>
							<Link to='/login' className={cn(buttonVariants({ variant: "ghost" }))}>
								Login
							</Link>
							<Link to='/signup' className={cn(buttonVariants({ variant: "secondary" }))}>
								Sign up
							</Link>
						</>
					)}
					<div className='w-[180px]'>
						<SignInOAuthButtons />
					</div>
				</SignedOut>

				<SignedIn>
					<UserButton />
				</SignedIn>
			</div>
		</div>
	);
};

export default Topbar;
