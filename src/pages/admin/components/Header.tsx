import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='mb-8 flex items-center justify-between gap-4'>
			<div className='flex items-center gap-3'>
				<Link to='/' className='rounded-lg'>
					<img src='/spotify.png' className='size-10 text-black' />
				</Link>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Admin Command Center</h1>
					<p className='mt-1 text-zinc-400'>Monitor platform health, publishing flow, and audience momentum.</p>
				</div>
			</div>
			<UserButton />
		</div>
	);
};
export default Header;
