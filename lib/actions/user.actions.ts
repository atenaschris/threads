"use server"

import { revalidatePath } from 'next/cache';
import UserModel, { User } from '../models/user.model';
import {connectToDB} from '../mongoose';

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
        const user = await UserModel.findOne({id:userId}) as User
        if(!user){
            throw new Error('User not found with id:'+ userId)
        }

    return user;

    } catch(err:any){
        throw new Error(err.message)
    }
}