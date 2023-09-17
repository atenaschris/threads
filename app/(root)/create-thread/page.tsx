import PostThread from "@/components/forms/PostThread";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function Page() {
    const user = await currentUser();

    if(!user) return null;
    
    const userInfo = await getCurrentUser(user.id);

    if(!userInfo.onBoarded) redirect('/onboarding')



    return <>
        <h1 className="head-text">Create Thread</h1>

        <PostThread userId={userInfo._id} />
    </>
}

export default Page;