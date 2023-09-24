import { fetchUserThreadsByAccountUserId } from "@/lib/actions/user.actions";
import { Thread } from "@/lib/models/thread.model";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface ThreadsCardProps {
    currentUserId:string;
    accountId:string;
    accountType:string
}

const ThreadsTab = async ({currentUserId,accountId,accountType}:ThreadsCardProps) => {

    const accountUserThreadsRes = await fetchUserThreadsByAccountUserId(accountId)

    if(!accountUserThreadsRes) redirect('/')

    console.log({accountUserThreads:accountUserThreadsRes.threads})

return (
    <section className="mt-9 flex flex-col gap-10">
        {accountUserThreadsRes.threads.map((accountUserThread:Thread) => (
            <ThreadCard 
            key={accountUserThread._id}
            id={accountUserThread._id}
            currentUserId={currentUserId}
            parentId={accountUserThread.parentId}
            content={accountUserThread.text}
            author={accountType === 'User' 
            ? {name:accountUserThreadsRes.name,image:accountUserThreadsRes.image,id:accountUserThreadsRes.id}
            : {name:accountUserThread.author.name,image:accountUserThread.author.image,id:accountUserThread.author.id}
        }
            community={accountUserThread.community}
            createdAt={accountUserThread.createdAt}
            comments={accountUserThread.children}
        /> 
        ))}
    </section>
)


}

export default ThreadsTab