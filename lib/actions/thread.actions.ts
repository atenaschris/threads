"use server"

import { revalidatePath } from "next/cache";
import ThreadModel, { Thread } from "../models/thread.model";
import UserModel from "../models/user.model";
import { connectToDB } from "../mongoose";

interface CreateThreadParams{
    text:string,
    author:string;
    communityId:string | null;
    path:string;
}

export async function fetchThreads(pageNumber = 1, pageSize = 20){
    try{
        connectToDB();
        const skipAmount = (pageNumber - 1) * pageSize
        const threadsQuery = ThreadModel.find({parentId:{$in:[null,undefined]}})
        .sort({createdAt:'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path:'author', model:UserModel})
        .populate({path:'children', populate:{path:'author',model:UserModel,select:"_id name parentId image"}})

        const totalThreadsCount = await ThreadModel.countDocuments({parentId:{$in:[null,undefined]}})
        const threads = await threadsQuery.exec()
        const isNext = totalThreadsCount > skipAmount + threads.length

        return {threads, isNext}
    } catch(err:any){
        throw new Error(`Error creating thread: ${err.message}`)
    }
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

export async function fetchThreadById(threadId:string):Promise<Thread>{
    connectToDB();
    try {

        //TODO: Populate community, later
        const threadQuery = await ThreadModel.findById(threadId)
        .populate({
            path:'author',
            model:UserModel,
            select:" _id id name image"
        })
        .populate({
            path:'children',
            populate:[
                {
                    path:'author',
                    model:UserModel,
                    select:"_id id name parentId image"
                },
                {
                    path:'children',
                    model:ThreadModel,
                    populate: {
                        path:'author',
                        model:UserModel,
                        select:"_id id name parentId image"
                    }
                }
            ]
        }).exec()

        return threadQuery

    } catch (error:any) {
        throw new Error(`Error Fetching Thread: ${error.message}`)
    }
}