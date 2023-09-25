import UserCard from "@/components/cards/UserCard";
import { fetchFilterUsers, getCurrentUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";


const Page = async () => {
  const user = await currentUser();

  if(!user) return null;

  const userInfo = await getCurrentUser(user.id)

  if (!userInfo.onBoarded) redirect('/onboeading')

  const {filteredUsers,isNext} = await fetchFilterUsers({
    userId:user.id,
    searchString:'',
    pageNumber:1,
    pageSize:25
  })

  return (
    <section>
        <h1 className="head-text mb-10">Search</h1>
        <div className="mt-14 flex flex-col gap-9">
          {filteredUsers.length === 0 ? (
           <p className="no-result">No Users</p>
          ) 
          : 
          (
            <>
            {filteredUsers.map((filteredUser:any) => (
              <UserCard
                key={filteredUser.id}
                id={filteredUser.id}
                name={filteredUser.name}
                username={filteredUser.username}
                imgUrl={filteredUser.image}
                personType="User" 
               />
            ))}
            </>
          )}
        </div>
    </section>
  )
}

export default Page