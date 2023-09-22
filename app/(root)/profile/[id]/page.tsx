import ProfileHeader from "@/components/shared/ProfileHeader";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";



const Page = async ({params}:{params:{id:string}}) => {

    if(!params.id) return null;

    const user = await currentUser();

    if(!user) return null;

    const userInfo = await getCurrentUser(params.id)

    if(!userInfo.onBoarded) redirect('/onboarding')


   return (<section>
    <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
    />
</section>) 
}

export default Page