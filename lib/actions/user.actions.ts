"use server"

import { revalidatePath } from 'next/cache';
import UserModel, { User } from '../models/user.model';
import {connectToDB} from '../mongoose';
import ThreadModel from '../models/thread.model';

interface UpdateUserParams{
    userId:string,
    username:string,
    name:string,
    bio:string,
    image:string,
    path:string
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

export async function getCurrentUser (userId:string):Promise<User>{
    
    try{
        connectToDB();
        return await UserModel.findOne({id:userId}) as User

    } catch(err:any){
        throw new Error(err.message)
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