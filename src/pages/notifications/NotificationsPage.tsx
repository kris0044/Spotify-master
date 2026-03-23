import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { BellRing } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotificationsPage = () => {
	const { notifications, fetchNotifications, markRead } = useNotificationStore();

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	return (
		<main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-900 to-black'>
			<Topbar />
			<ScrollArea className='h-[calc(100vh-180px)]'>
				<div className='mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 sm:px-6'>
					<Card className='border-zinc-800 bg-zinc-950/80'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2 text-2xl'>
								<BellRing className='h-5 w-5 text-emerald-400' />
								Notifications
							</CardTitle>
						</CardHeader>
					</Card>

					{notifications.map((notification) => (
						<Card key={notification._id} className='border-zinc-800 bg-zinc-950/90'>
							<CardContent className='flex items-center justify-between gap-4 p-5'>
								<div>
									<div className='flex items-center gap-2'>
										<h3 className='font-medium text-white'>{notification.title}</h3>
										{!notification.isRead && <span className='h-2 w-2 rounded-full bg-emerald-400' />}
									</div>
									<p className='mt-1 text-sm text-zinc-300'>{notification.message}</p>
									<div className='mt-2 text-xs text-zinc-500'>
										{new Date(notification.createdAt).toLocaleString()}
									</div>
								</div>
								<div className='flex gap-2'>
									{notification.link && (
										<Button asChild variant='outline' className='border-zinc-700 bg-transparent'>
											<Link to={notification.link}>Open</Link>
										</Button>
									)}
									{!notification.isRead && (
										<Button onClick={() => markRead(notification._id)}>Mark Read</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}

					{notifications.length === 0 && (
						<Card className='border-zinc-800 bg-zinc-950/70'>
							<CardContent className='p-8 text-center text-zinc-400'>
								No notifications yet. Newsletter updates will appear here.
							</CardContent>
						</Card>
					)}
				</div>
			</ScrollArea>
		</main>
	);
};

export default NotificationsPage;
