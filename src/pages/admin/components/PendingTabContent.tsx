import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import PendingSongsTable from "./PendingSongsTable";
import PendingAlbumsTable from "./PendingAlbumsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Album } from "lucide-react";

const PendingTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<Clock className='size-5 text-yellow-500' />
							Pending Approvals
						</CardTitle>
						<CardDescription>Review and approve content from artists</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue='songs' className='space-y-4'>
					<TabsList className='p-1 bg-zinc-900/50'>
						<TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
							<Music className='mr-2 size-4' />
							Pending Songs
						</TabsTrigger>
						<TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
							<Album className='mr-2 size-4' />
							Pending Albums
						</TabsTrigger>
					</TabsList>
					<TabsContent value='songs'>
						<PendingSongsTable />
					</TabsContent>
					<TabsContent value='albums'>
						<PendingAlbumsTable />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
};

export default PendingTabContent;

