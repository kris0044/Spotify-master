import { Music2, ShieldCheck, Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
	title: string;
	subtitle: string;
	children: ReactNode;
	footerText: string;
	footerLinkLabel: string;
	footerLinkTo: string;
}

const AuthShell = ({
	title,
	subtitle,
	children,
	footerText,
	footerLinkLabel,
	footerLinkTo,
}: AuthShellProps) => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white'>
			<div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
				<header className='flex items-center justify-between mb-10'>
					<Link to='/' className='flex items-center gap-2 text-white/90 hover:text-white'>
						<img src='/spotify.png' className='size-8' alt='Spotify logo' />
						<span className='font-semibold'>Spotify Clone</span>
					</Link>
					<div className='hidden md:flex items-center gap-5 text-sm text-zinc-300'>
						<div className='flex items-center gap-2'>
							<Music2 className='size-4 text-emerald-400' />
							User
						</div>
						<div className='flex items-center gap-2'>
							<Sparkles className='size-4 text-emerald-400' />
							Artist
						</div>
						<div className='flex items-center gap-2'>
							<ShieldCheck className='size-4 text-emerald-400' />
							Admin
						</div>
					</div>
				</header>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
					<section className='space-y-4'>
						<p className='text-emerald-400 text-sm font-medium uppercase tracking-wide'>One auth flow for all roles</p>
						<h1 className='text-4xl sm:text-5xl font-black leading-tight'>Listen, create, and manage from one account.</h1>
						<p className='text-zinc-300 max-w-xl'>
							Sign in once. Role-specific permissions for user, artist, and admin are handled after authentication.
						</p>
					</section>

					<section className='rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur p-4 sm:p-6'>
						<div className='mb-4'>
							<h2 className='text-2xl font-semibold'>{title}</h2>
							<p className='text-zinc-400 text-sm mt-1'>{subtitle}</p>
						</div>
						<div className='[&_.cl-rootBox]:w-full [&_.cl-card]:w-full [&_.cl-card]:shadow-none [&_.cl-card]:bg-transparent [&_.cl-card]:border-0 [&_.cl-footer]:hidden [&_.cl-dividerLine]:bg-zinc-700 [&_.cl-dividerText]:text-zinc-400 [&_.cl-socialButtonsBlockButton]:bg-zinc-800 [&_.cl-socialButtonsBlockButton]:border-zinc-700 [&_.cl-socialButtonsBlockButton]:text-white [&_.cl-formButtonPrimary]:bg-emerald-500 [&_.cl-formButtonPrimary]:hover:bg-emerald-400 [&_.cl-formFieldInput]:bg-zinc-800 [&_.cl-formFieldInput]:border-zinc-700 [&_.cl-formFieldInput]:text-white [&_.cl-formFieldLabel]:text-zinc-300 [&_.cl-headerTitle]:hidden [&_.cl-headerSubtitle]:hidden'>
							{children}
						</div>
						<p className='mt-4 text-sm text-zinc-400'>
							{footerText}{" "}
							<Link to={footerLinkTo} className='text-emerald-400 hover:text-emerald-300'>
								{footerLinkLabel}
							</Link>
						</p>
					</section>
				</div>
			</div>
		</div>
	);
};

export default AuthShell;
