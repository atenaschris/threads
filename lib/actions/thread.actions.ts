"use server"

import { revalidatePath } from "next/cache";
import ThreadModel, { Thread } from "../models/thread.model";
import UserModel from "../models/user.model";
import { connectToDB } from "../mongoose";
import { threadId } from "worker_threads";

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

export async function addCommentToThread(
    parentThreadId:string,
    commentText:string,
    commentCreatorCurrentAuthUserId:string,
    path:string
){
    try {
        connectToDB()
        // Find the thread which we want to comment on
        const parentThread = await ThreadModel.findById(parentThreadId)
      
        if(!parentThread) throw new Error(`Thread not found...`)

        // We have to create a new thread attaching the commentText
        const commentParentThread = await new ThreadModel({
            text:commentText,
            author:commentCreatorCurrentAuthUserId,
            parentId:parentThreadId
        });

        // We have to save this new comment in the DB
        await commentParentThread.save();

        // Update the original thread to include the newly added comment
        parentThread.children.push(commentParentThread._id);

        // Save the parentThread to the Db to migrate the newly added chilren comment
        await parentThread.save()

        console.log(commentParentThread)
        console.log(parentThread)

        // Revalidate the path in order to invalidate the cache
        revalidatePath(path)
    } catch (error) {
        throw new Error(`Failed to add comment to Thread: ${parentThreadId} with the text: ${commentText}`)
    }
}