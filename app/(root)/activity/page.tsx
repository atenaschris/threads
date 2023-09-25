import { getCurrentUser, getUserActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();

  if(!user) return null;

  const userInfo = await getCurrentUser(user.id);

  if(!userInfo.onBoarded) redirect('/onboarding')

  const activities = await getUserActivity(userInfo._id)


    return (
      <section>
          <h1 className="head-text mb-10">Activity</h1>
          <section className="mt-10 flex flex-col gap-5">
            {activities.length > 0 ? (
              <>
                {activities.map(activity =>(
                  <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                    <article className="activity-card">
                      <Image 
                        src={activity.author.image}
                        alt="Profile Picture"
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                      <p className="!text-small-regular text-light-1">
                        <span className="mr-1 text-primary-500">
                          {activity.author.name}
                        </span>{" "}
                        replied to yout thread
                      </p>
                    </article>
                  </Link>
                ))}
              </>
            ): <p className="!text-base-regular text-light-3">No Activities</p>
            
            }
          </section>
      </section>
    )
  }
  
  export default Page