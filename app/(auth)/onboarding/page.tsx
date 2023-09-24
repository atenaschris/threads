import AccountProfile from "@/components/forms/AccountProfile"
import { getCurrentUser } from "@/lib/actions/user.actions";
import { User } from "@/lib/models/user.model";

import { currentUser } from "@clerk/nextjs/server"
export type AccountProfileUserProps = Omit<User,'threads' |'communities'>

async function Page (){

    const user = await currentUser();

    console.log({user})

    if (!user) return null;
    
    let userInfo = await getCurrentUser(user.id);
     
    const userData:AccountProfileUserProps = {
        id:user?.id,
        _id:userInfo?._id ?? '',
        username:userInfo?.username ?? user.username ?? '',
        name:userInfo?.name ?? user.firstName ,
        bio:userInfo?.bio ?? "",
        image: userInfo?.image ?? user.imageUrl,
        onBoarded:userInfo?.onBoarded ?? false
        
    }
    
    return (
        <main className="w-full h-full">
            <h1 className="head-text">On Boarding</h1>
            <p className="mt-3 text-base-regular text-light-2">Complete your profile now to use Threads</p>
            <section className="mt-9 bg-dark-2 p-10">
                <AccountProfile user={userData} btnTitle="Continue"/>
            </section>
        </main>
    )
}

export default Page