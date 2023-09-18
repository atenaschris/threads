"use server"

import { revalidatePath } from "next/cache";
import ThreadModel from "../models/thread.model";
import UserModel from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CreateThreadParams{
    text:string,
    author:string;
    communityId:string | null;
    path:string;
}


export async function createThread({text,author,communityId,path}:CreateThreadParams){
    try{
        connectToDB();
        const newThread = await ThreadModel.create({
           text,
           author,
           community:null, 
        });

        await UserModel.findByIdAndUpdate(author,{
            $push:{threads:newThread._id}
        })

        revalidatePath(path)

    } catch(err:any){
        throw new Error(`Error creatign thread: ${err.message}`)
    }
}