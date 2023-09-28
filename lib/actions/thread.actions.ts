"use server"

import { revalidatePath } from "next/cache";
import ThreadModel, { Thread } from "../models/thread.model";
import UserModel from "../models/user.model";
import { connectToDB } from "../mongoose";
import { threadId } from "worker_threads";
import CommunityModel from "../models/community.model";

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
        .populate({
            path:'author', 
            model:UserModel
        })
        .populate({
            path: "community",
            model: CommunityModel,
        })
        .populate({
            path:'children', 
            populate:{
                path:'author',model:UserModel,select:"_id name parentId image"
            }
        })

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
        const communityIdObject = await CommunityModel.findOne(
            { id: communityId },
            { _id: 1 }
          );

        const newThread = await ThreadModel.create({
           text,
           author,
           community:communityId, 
        });

        await UserModel.findByIdAndUpdate(author,{
            $push:{threads:newThread._id}
        })

        if (communityIdObject) {
            // Update Community model
            await CommunityModel.findByIdAndUpdate(communityIdObject, {
              $push: { threads: newThread._id },
            });
          }

        revalidatePath(path)

    } catch(err:any){
        throw new Error(`Error creating thread: ${err.message}`)
    }
}
export async function deleteThread(id: string, path: string): Promise<void> {
    try {
      connectToDB();
  
      // Find the thread to be deleted (the main thread)
      const mainThread = await ThreadModel.findById(id).populate("author community");
  
      if (!mainThread) {
        throw new Error("Thread not found");
      }
  
      // Fetch all child threads and their descendants recursively
      const descendantThreads = await fetchAllChildThreads(id);
  
      // Get all descendant thread IDs including the main thread ID and child thread IDs
      const descendantThreadIds = [
        id,
        ...descendantThreads.map((thread) => thread._id),
      ];
  
      // Extract the authorIds and communityIds to update User and Community models respectively
      const uniqueAuthorIds = new Set(
        [
          ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainThread.author?._id?.toString(),
        ].filter((id) => id !== undefined)
      );
  
      const uniqueCommunityIds = new Set(
        [
          ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
          mainThread.community?._id?.toString(),
        ].filter((id) => id !== undefined)
      );
  
      // Recursively delete child threads and their descendants
      await ThreadModel.deleteMany({ _id: { $in: descendantThreadIds } });
  
      // Update User model
      await UserModel.updateMany(
        { _id: { $in: Array.from(uniqueAuthorIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );
  
      // Update Community model
      await CommunityModel.updateMany(
        { _id: { $in: Array.from(uniqueCommunityIds) } },
        { $pull: { threads: { $in: descendantThreadIds } } }
      );
  
      revalidatePath(path);
    } catch (error: any) {
      throw new Error(`Failed to delete thread: ${error.message}`);
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
        }) // Populate the author field with _id, image and username
        .populate({
            path: "community",
            model: CommunityModel,
            select: "_id id name image",
          }) // Populate the community field with _id image and username
        .populate({
            path:'children', // Populate the children field
            populate:[
                {
                    path:'author', // Populate the author field within children
                    model:UserModel,
                    select:"_id id name parentId image"  // Select only _id and username fields of the author
                },
                {
                    path:'children', // Populate the children field within children
                    model:ThreadModel, // The model of the nested children (assuming it's the same "Thread" model)
                    populate: {
                        path:'author', // Populate the author field within nested children
                        model:UserModel,
                        select:"_id id name parentId image"  // Select only _id and username fields of the author
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

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await ThreadModel.find({ parentId: threadId });
  
    const descendantThreads = [];
    for (const childThread of childThreads) {
      const descendants = await fetchAllChildThreads(childThread._id);
      descendantThreads.push(childThread, ...descendants);
    }
  
    return descendantThreads;
  }


  