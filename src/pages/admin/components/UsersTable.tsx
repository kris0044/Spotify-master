import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminStore } from "@/stores/useAdminStore";
import { Trash2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

const UsersTable = () => {
	const { users, isLoading, fetchUsers, updateUser, deleteUser } = useAdminStore();
	const [editingUserId, setEditingUserId] = useState<string | null>(null);
	const [selectedRole, setSelectedRole] = useState<"user" | "admin" | "artist">("user");

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleUpdateRole = async (userId: string) => {
		await updateUser(userId, selectedRole);
		setEditingUserId(null);
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<div className='text-zinc-400'>Loading users...</div>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className='hover:bg-zinc-800/50'>
					<TableHead className='w-[50px]'></TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Joined</TableHead>
					<TableHead className='text-right'>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user._id} className='hover:bg-zinc-800/50'>
						<TableCell>
							<img src={user.imageUrl} alt={user.fullName} className='size-10 rounded-full object-cover' />
						</TableCell>
						<TableCell className='font-medium'>{user.fullName}</TableCell>
						<TableCell>
							{editingUserId === user._id ? (
								<div className='flex items-center gap-2'>
									<Select
										value={selectedRole}
										onValueChange={(value) => setSelectedRole(value as "user" | "admin" | "artist")}
									>
										<SelectTrigger className='w-32'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='user'>User</SelectItem>
											<SelectItem value='artist'>Artist</SelectItem>
											<SelectItem value='admin'>Admin</SelectItem>
										</SelectContent>
									</Select>
									<Button size='sm' onClick={() => handleUpdateRole(user._id)}>
										Save
									</Button>
									<Button size='sm' variant='ghost' onClick={() => setEditingUserId(null)}>
										Cancel
									</Button>
								</div>
							) : (
								<span className='inline-flex items-center px-2 py-1 rounded bg-zinc-700/50 text-sm'>
									{user.role || "user"}
								</span>
							)}
						</TableCell>
						<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Calendar className='h-4 w-4' />
								{user.createdAt?.split("T")[0] || "N/A"}
							</span>
						</TableCell>
						<TableCell className='text-right'>
							<div className='flex gap-2 justify-end'>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => {
										setEditingUserId(user._id);
										setSelectedRole((user.role as "user" | "admin" | "artist") || "user");
									}}
								>
									Edit Role
								</Button>
								<Dialog>
									<DialogTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
										>
											<Trash2 className='size-4' />
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Delete User</DialogTitle>
											<DialogDescription>
												Are you sure you want to delete {user.fullName}? This action cannot be undone.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<Button variant='outline' onClick={() => {}}>
												Cancel
											</Button>
											<Button variant='destructive' onClick={() => deleteUser(user._id)}>
												Delete
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default UsersTable;

