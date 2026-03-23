import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/stores/useAdminStore";
import { useMusicStore } from "@/stores/useMusicStore";
import { AnalyticsRange } from "@/types";
import { Activity, Album, AudioLines, Clock3, Disc3, Music2, Sparkles, Users2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
	{ value: "week", label: "Week" },
	{ value: "month", label: "Month" },
	{ value: "year", label: "Year" },
];

const compactNumber = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

const fullNumber = new Intl.NumberFormat("en-US");

const formatMetric = (value: number) => {
	if (value < 1000) {
		return fullNumber.format(value);
	}

	return compactNumber.format(value);
};

const AdminOverview = () => {
	const [range, setRange] = useState<AnalyticsRange>("month");
	const { analytics, fetchAnalytics, isLoading } = useAdminStore();
	const { stats } = useMusicStore();

	useEffect(() => {
		void fetchAnalytics(range);
	}, [range, fetchAnalytics]);

	const chartPoints = useMemo(() => {
		const points = analytics?.playsTimeline || [];
		if (!points.length) {
			return "";
		}

		const width = 100;
		const height = 100;
		const maxValue = Math.max(...points.map((point) => point.value), 1);

		return points
			.map((point, index) => {
				const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
				const y = height - (point.value / maxValue) * 82 - 9;
				return `${x},${y}`;
			})
			.join(" ");
	}, [analytics]);

	const chartArea = useMemo(() => {
		if (!chartPoints) {
			return "";
		}

		return `0,100 ${chartPoints} 100,100`;
	}, [chartPoints]);

	return (
		<div className='mb-8 space-y-6'>
			<section className='overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(160deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]'>
				<div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
					<div className='max-w-2xl'>
						<div className='mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-emerald-300'>
							<Sparkles className='h-3.5 w-3.5' />
							Admin Intelligence
						</div>
						<h2 className='text-3xl font-semibold tracking-tight text-white sm:text-4xl'>
							A clearer view of your platform performance.
						</h2>
						<p className='mt-3 max-w-xl text-sm leading-6 text-zinc-300'>
							Track catalog growth, listener momentum, and your strongest artists and songs across week, month,
							and year windows.
						</p>
					</div>
					<div className='flex flex-wrap gap-2'>
						{RANGE_OPTIONS.map((option) => (
							<Button
								key={option.value}
								type='button'
								variant={range === option.value ? "default" : "outline"}
								className={
									range === option.value
										? "bg-white text-black hover:bg-zinc-100"
										: "border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
								}
								onClick={() => setRange(option.value)}
							>
								{option.label}
							</Button>
						))}
					</div>
				</div>

				<div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
					<div className='rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-xs uppercase tracking-[0.24em] text-zinc-400'>Streams</p>
								<p className='mt-3 text-3xl font-semibold text-white'>
									{formatMetric(analytics?.overview.totalStreams || 0)}
								</p>
							</div>
							<div className='rounded-2xl bg-emerald-400/10 p-3 text-emerald-300'>
								<AudioLines className='h-5 w-5' />
							</div>
						</div>
					</div>
					<div className='rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-xs uppercase tracking-[0.24em] text-zinc-400'>Active Listeners</p>
								<p className='mt-3 text-3xl font-semibold text-white'>
									{formatMetric(analytics?.overview.activeListeners || 0)}
								</p>
							</div>
							<div className='rounded-2xl bg-sky-400/10 p-3 text-sky-300'>
								<Users2 className='h-5 w-5' />
							</div>
						</div>
					</div>
					<div className='rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-xs uppercase tracking-[0.24em] text-zinc-400'>New Releases</p>
								<p className='mt-3 text-3xl font-semibold text-white'>
									{formatMetric((analytics?.overview.newSongs || 0) + (analytics?.overview.newAlbums || 0))}
								</p>
							</div>
							<div className='rounded-2xl bg-violet-400/10 p-3 text-violet-300'>
								<Disc3 className='h-5 w-5' />
							</div>
						</div>
					</div>
					<div className='rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-xs uppercase tracking-[0.24em] text-zinc-400'>Pending Review</p>
								<p className='mt-3 text-3xl font-semibold text-white'>
									{formatMetric((analytics?.overview.pendingSongs || 0) + (analytics?.overview.pendingAlbums || 0))}
								</p>
							</div>
							<div className='rounded-2xl bg-amber-400/10 p-3 text-amber-300'>
								<Clock3 className='h-5 w-5' />
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className='grid gap-4 xl:grid-cols-[1.5fr_0.9fr]'>
				<section className='rounded-[24px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]'>
					<div className='flex items-start justify-between gap-4'>
						<div>
							<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Performance Flow</p>
							<h3 className='mt-2 text-xl font-semibold text-white'>Streaming trend</h3>
							<p className='mt-1 text-sm text-zinc-400'>Playback volume across the selected reporting window.</p>
						</div>
						<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300'>
							{analytics?.window.startDate
								? `${new Date(analytics.window.startDate).toLocaleDateString()} - ${new Date(
										analytics.window.endDate
								  ).toLocaleDateString()}`
								: "Loading range"}
						</div>
					</div>

					<div className='mt-6 rounded-[22px] border border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4'>
						<div className='mb-4 flex items-end justify-between gap-3'>
							<div>
								<p className='text-sm text-zinc-400'>Total streams in range</p>
								<p className='mt-1 text-3xl font-semibold text-white'>
									{formatMetric(analytics?.overview.totalStreams || 0)}
								</p>
							</div>
							<div className='flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300'>
								<Activity className='h-3.5 w-3.5' />
								Live trend
							</div>
						</div>

						<div className='h-56'>
							{analytics?.playsTimeline.length ? (
								<div className='flex h-full flex-col justify-between'>
									<svg viewBox='0 0 100 100' preserveAspectRatio='none' className='h-44 w-full overflow-visible'>
										<defs>
											<linearGradient id='admin-chart-fill' x1='0%' x2='0%' y1='0%' y2='100%'>
												<stop offset='0%' stopColor='rgba(16,185,129,0.45)' />
												<stop offset='100%' stopColor='rgba(16,185,129,0.02)' />
											</linearGradient>
										</defs>
										{[20, 40, 60, 80].map((value) => (
											<line
												key={value}
												x1='0'
												x2='100'
												y1={value}
												y2={value}
												stroke='rgba(255,255,255,0.08)'
												strokeDasharray='1.5 3'
											/>
										))}
										<polygon points={chartArea} fill='url(#admin-chart-fill)' />
										<polyline
											points={chartPoints}
											fill='none'
											stroke='rgb(52,211,153)'
											strokeWidth='2.4'
											strokeLinecap='round'
											strokeLinejoin='round'
										/>
									</svg>
									<div className='grid grid-cols-4 gap-2 text-[11px] text-zinc-500'>
										{analytics.playsTimeline
											.filter((_, index, points) => index === 0 || index === points.length - 1 || index === Math.floor(points.length / 2) || index === Math.floor(points.length / 4))
											.slice(0, 4)
											.map((point) => (
												<div key={`${point.label}-${point.value}`} className='truncate'>
													{point.label}
												</div>
											))}
									</div>
								</div>
							) : (
								<div className='flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500'>
									{isLoading ? "Loading analytics..." : "No listening history for this range yet."}
								</div>
							)}
						</div>
					</div>
				</section>

				<section className='rounded-[24px] border border-white/10 bg-zinc-950/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]'>
					<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Best Song</p>
					<h3 className='mt-2 text-xl font-semibold text-white'>Top performer in this range</h3>

					{analytics?.bestSong ? (
						<div className='mt-5 space-y-4'>
							<img
								src={analytics.bestSong.imageUrl}
								alt={analytics.bestSong.title}
								className='aspect-square w-full rounded-[22px] object-cover shadow-2xl'
							/>
							<div>
								<h4 className='text-2xl font-semibold text-white'>{analytics.bestSong.title}</h4>
								<p className='mt-1 text-sm text-zinc-400'>{analytics.bestSong.artist}</p>
							</div>
							<div className='grid grid-cols-2 gap-3'>
								<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Streams</p>
									<p className='mt-2 text-2xl font-semibold text-white'>
										{formatMetric(analytics.bestSong.streams)}
									</p>
								</div>
								<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Listeners</p>
									<p className='mt-2 text-2xl font-semibold text-white'>
										{formatMetric(analytics.bestSong.listeners)}
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className='mt-5 flex h-[320px] items-center justify-center rounded-[22px] border border-dashed border-white/10 text-sm text-zinc-500'>
							No song activity recorded in this range.
						</div>
					)}
				</section>
			</div>

			<div className='grid gap-4 xl:grid-cols-3'>
				<section className='rounded-[24px] border border-white/10 bg-zinc-950/90 p-5'>
					<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Top Artists</p>
					<h3 className='mt-2 text-xl font-semibold text-white'>Best artists by streams</h3>
					<div className='mt-5 space-y-3'>
						{analytics?.topArtists.length ? (
							analytics.topArtists.map((artist, index) => (
								<div key={artist.name} className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
									<div className='flex items-center gap-3'>
										<div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-sm font-semibold text-emerald-300'>
											{index + 1}
										</div>
										<div>
											<p className='font-medium text-white'>{artist.name}</p>
											<p className='text-xs text-zinc-500'>{artist.songCount} active songs</p>
										</div>
									</div>
									<div className='text-right'>
										<p className='font-semibold text-white'>{formatMetric(artist.streams)}</p>
										<p className='text-xs text-zinc-500'>streams</p>
									</div>
								</div>
							))
						) : (
							<div className='rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-zinc-500'>
								No artist ranking available yet.
							</div>
						)}
					</div>
				</section>

				<section className='rounded-[24px] border border-white/10 bg-zinc-950/90 p-5'>
					<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Top Listeners</p>
					<h3 className='mt-2 text-xl font-semibold text-white'>Most engaged listeners</h3>
					<div className='mt-5 space-y-3'>
						{analytics?.topListeners.length ? (
							analytics.topListeners.map((listener, index) => (
								<div key={`${listener.name}-${index}`} className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3'>
									<div className='flex items-center gap-3'>
										{listener.imageUrl ? (
											<img src={listener.imageUrl} alt={listener.name} className='h-10 w-10 rounded-2xl object-cover' />
										) : (
											<div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/10 text-sm font-semibold text-sky-300'>
												{listener.name.charAt(0).toUpperCase()}
											</div>
										)}
										<div>
											<p className='font-medium text-white'>{listener.name}</p>
											<p className='text-xs text-zinc-500'>{listener.uniqueSongs} unique songs</p>
										</div>
									</div>
									<div className='text-right'>
										<p className='font-semibold text-white'>{formatMetric(listener.streams)}</p>
										<p className='text-xs text-zinc-500'>plays</p>
									</div>
								</div>
							))
						) : (
							<div className='rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-zinc-500'>
								No listener ranking available yet.
							</div>
						)}
					</div>
				</section>

				<section className='rounded-[24px] border border-white/10 bg-zinc-950/90 p-5'>
					<p className='text-xs uppercase tracking-[0.24em] text-zinc-500'>Catalog Snapshot</p>
					<h3 className='mt-2 text-xl font-semibold text-white'>Platform totals</h3>
					<div className='mt-5 grid gap-3'>
						<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Songs</p>
									<p className='mt-2 text-2xl font-semibold text-white'>{fullNumber.format(stats.totalSongs)}</p>
								</div>
								<Music2 className='h-5 w-5 text-emerald-300' />
							</div>
						</div>
						<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Albums</p>
									<p className='mt-2 text-2xl font-semibold text-white'>{fullNumber.format(stats.totalAlbums)}</p>
								</div>
								<Album className='h-5 w-5 text-violet-300' />
							</div>
						</div>
						<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Artists</p>
									<p className='mt-2 text-2xl font-semibold text-white'>{fullNumber.format(stats.totalArtists)}</p>
								</div>
								<Disc3 className='h-5 w-5 text-amber-300' />
							</div>
						</div>
						<div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-xs uppercase tracking-[0.22em] text-zinc-500'>Users</p>
									<p className='mt-2 text-2xl font-semibold text-white'>{fullNumber.format(stats.totalUsers)}</p>
								</div>
								<Users2 className='h-5 w-5 text-sky-300' />
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default AdminOverview;
