import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import UsersTable from "./UsersTable";

const UsersTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Users className='size-5 text-blue-500' />
							User Management
						</CardTitle>
						<CardDescription>Manage user roles and permissions</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<UsersTable />
			</CardContent>
		</Card>
	);
};

export default UsersTabContent;

