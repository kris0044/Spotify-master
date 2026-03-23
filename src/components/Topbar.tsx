import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Bell, LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	const { unreadCount } = useNotificationStore();
	const location = useLocation();
	const isAuthPage = location.pathname.startsWith("/login") || location.pathname.startsWith("/signup");

	return (
		<div className='sticky top-0 z-20 border-b border-white/10 bg-zinc-950/70 px-4 py-4 backdrop-blur-xl'>
			<div className='flex items-center justify-between gap-4'>
				<div className='flex items-center gap-3'>
					<Link to='/' className='flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10'>
						<div className='flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#34d399,#22c55e,#0f172a)] shadow-[0_10px_30px_rgba(16,185,129,0.35)]'>
							<img src='/spotify.png' className='size-5' alt='Spotify logo' />
						</div>
						<div className='hidden sm:block'>
							<div className='text-sm font-semibold tracking-[0.18em] text-white'>SPOTIFY</div>
							<div className='text-[11px] uppercase tracking-[0.22em] text-zinc-500'>Listen better</div>
						</div>
					</Link>

				</div>

				<div className='flex items-center gap-3'>
					{isAdmin && (
						<Link
							to='/admin'
							className={cn(
								buttonVariants({ variant: "outline" }),
								"border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
							)}
						>
							<LayoutDashboardIcon className='size-4' />
							<span className='hidden sm:inline'>Admin Dashboard</span>
						</Link>
					)}

					<SignedOut>
						{!isAuthPage && (
							<>
								<Link
									to='/login'
									className={cn(buttonVariants({ variant: "ghost" }), "text-zinc-200 hover:bg-white/10 hover:text-white")}
								>
									Login
								</Link>
								<Link
									to='/signup'
									className={cn(
										buttonVariants({ variant: "secondary" }),
										"bg-white text-black hover:bg-zinc-100"
									)}
								>
									Sign up
								</Link>
							</>
						)}
						<div className='hidden md:block w-[180px]'>
							<SignInOAuthButtons />
						</div>
					</SignedOut>

					<SignedIn>
						<Link
							to='/notifications'
							className={cn(
								buttonVariants({ variant: "ghost", className: "relative rounded-full border border-white/10 bg-white/5 hover:bg-white/10" })
							)}
						>
							<Bell className='size-4' />
							{unreadCount > 0 && (
								<span className='absolute -right-1 -top-1 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold text-black'>
									{unreadCount}
								</span>
							)}
						</Link>
						<div className='rounded-full border border-white/10 bg-white/5 p-1'>
							<UserButton />
						</div>
					</SignedIn>
				</div>
			</div>
		</div>
	);
};

export default Topbar;
