import Image from "next/image";

interface ProfileHeaderProps{
    accountId:string;
    authUserId:string;
    name:string;
    userName:string;
    imgUrl:string;
    bio:string
}


const ProfileHeader = ({
    accountId,
    authUserId,
    name,
    userName,
    imgUrl,
    bio
}:ProfileHeaderProps) => {
    return (
        <div className="flex w-full flex-col">
            <div className="flex" >
                <div className="flex items-center gap-3" >
                    <div className="relative h-20 w-20 object-cover">
                        <Image
                            src={imgUrl}
                            alt="Profile Image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                        <p className="text-base-medium text-gray-1">@{userName}</p>
                    </div> 
                </div>
            </div>
            {/* TODO: Community */}
            <p className="mt-7 max-w-lg text-base-regular text-light-2">{bio}</p>
            <div className="mt-12 h-0.5 w-full bg-dark-3"></div>
        </div>
    )
}

export default ProfileHeader