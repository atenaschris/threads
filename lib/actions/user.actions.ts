"use server"

import { revalidatePath } from 'next/cache';
import UserModel, { User } from '../models/user.model';
import {connectToDB} from '../mongoose';
import ThreadModel from '../models/thread.model';
import { FilterQuery, SortOrder } from 'mongoose';
import CommunityModel from '../models/community.model';

interface UpdateUserParams{
    userId:string,
    username:string,
    name:string,
    bio:string,
    image:string,
    path:string
}

export async function getCurrentUser (userId:string):Promise<void>{
    
    try{
        connectToDB();
        return await UserModel.findOne({id:userId}).populate({
            path: "communities",
            model: CommunityModel,
          });

    } catch(err:any){
        throw new Error(err.message)
    }
}

export async function updateUser ({userId,username,name,bio,image,path}:UpdateUserParams):Promise<void>{
    
    try{
        if (!userId || !username || !name || !bio || !image || !path) {
            throw new Error("Missing required parameters");
        }
        connectToDB();
        await UserModel.findOneAndUpdate(
            {id:userId},
            {
            username:username.toLowerCase(),
            name,
            bio,
            image,
            onBoarded: true
            },
            {upsert:true}
        )

        if(path === '/profile/edit'){
            revalidatePath(path)
        }
    } catch(err:any){
        throw new Error(`Failed to create/update user: ${err.message}`)
    }
}

export async function fetchUserThreadsByAccountUserId(accountUserId:string){
try {
    connectToDB();
    // TODO: Populate Community
    const accountUserThreads = await UserModel.findOne({id:accountUserId})
    .populate({path:'threads',model:ThreadModel,populate:{
        path:'children',
        model:ThreadModel,
        populate:{
            path:'author',
            model:UserModel,
            select:'name image id'
        }
    }})

    return accountUserThreads

} catch (error:any) {
    throw new Error(`Failed to fetch user threads: ${error.message}`)
}


}


export async function fetchFilterUsers({
    userId,
    searchString = '',
    pageNumber = 1,
    pageSize = 20,
    sortBy="desc"
}:{
    userId:string,
    searchString?:string;
    pageNumber?:number;
    pageSize?:number;
    sortBy?:SortOrder
}){
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString,"i")

        const usersFilteredQuery:FilterQuery<typeof UserModel> = {
            id:{ $ne:userId}
        }

        if(searchString.trim() !== ''){
            usersFilteredQuery.$or = [
                {username:{$regex:regex}},
                {name:{$regex:regex}}
            ]
        }

        const sortOptions = {createdAt:sortBy}

        const filteredUsers = await UserModel.find(usersFilteredQuery)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totalUsersCount = await UserModel.countDocuments(usersFilteredQuery);

        const isNext = totalUsersCount > skipAmount + filteredUsers.length;

        return {filteredUsers,isNext}

    } catch (error:any) {
        throw new Error(`Failed to fetch Users`)
    }
}


export async function getUserActivity(userId:string){
    try {
        connectToDB();

        //find all threads created by the user
        const userThreads = await ThreadModel.find({author:userId})
        console.log({userThreads})
        // collect all the child thread ids (replies) from the 'children' field
        const childThreadsIds = userThreads.reduce((acc,userThread) => acc.concat(userThread.children),[])
        console.log({childThreadsIds})
        // find all the replies (all the comment of other users to our threads, excluded the one by ourself)
        const replies = await ThreadModel.find({
            _id:{$in: childThreadsIds},
            author:{$ne:userId}
        }).populate({
            path:'author',
            model:UserModel,
            select:'name image _id'
        })

        console.log({replies})

        return replies

    } catch (error:any) {
        throw new Error(error.message)
    }
}