import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/useChatStore";

const formatPresence = (isOnline?: boolean, lastSeenAt?: string | null) => {
	if (isOnline) {
		return "Online";
	}

	if (!lastSeenAt) {
		return "Offline";
	}

	return `Last seen ${new Date(lastSeenAt).toLocaleString("en-US", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	})}`;
};

const ChatHeader = () => {
	const { selectedUser, onlineUsers } = useChatStore();

	if (!selectedUser) return null;

	return (
		<div className='p-4 border-b border-zinc-800'>
			<div className='flex items-center gap-3'>
				<Avatar>
					<AvatarImage src={selectedUser.imageUrl} />
					<AvatarFallback>{selectedUser.fullName[0]}</AvatarFallback>
				</Avatar>
				<div>
					<h2 className='font-medium'>{selectedUser.fullName}</h2>
					<p className='text-sm text-zinc-400'>
						{formatPresence(onlineUsers.has(selectedUser.clerkId) || selectedUser.isOnline, selectedUser.lastSeenAt)}
					</p>
					{selectedUser.currentSong?.title ? (
						<p className='text-xs text-emerald-400'>
							Listening to {selectedUser.currentSong.title}
							{selectedUser.currentSong.artist ? ` • ${selectedUser.currentSong.artist}` : ""}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
};
export default ChatHeader;
