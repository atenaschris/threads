import { fetchUserThreadsByAccountUserId } from "@/lib/actions/user.actions";
import { Thread } from "@/lib/models/thread.model";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityThreads } from "@/lib/actions/community.actions";

interface ThreadsCardProps {
    currentUserId:string;
    accountId:string;
    accountType:string
}

const ThreadsTab = async ({currentUserId,accountId,accountType}:ThreadsCardProps) => {

    let result:any;

    if(accountType === 'Community'){
        result = await fetchCommunityThreads(accountId)
    } else {
        result = await fetchUserThreadsByAccountUserId(accountId)
    }

    if(!result) redirect('/')

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((accountUserThread:Thread) => (
                <ThreadCard 
                key={accountUserThread._id}
                id={accountUserThread._id}
                currentUserId={currentUserId}
                parentId={accountUserThread.parentId}
                content={accountUserThread.text}
                author={accountType === 'User' 
                ? {name:result.name,image:result.image,id:result.id}
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