import mongoose, {Schema,  InferSchemaType }  from "mongoose";

const threadSchema = new Schema({
    text: {type:String,required:true},
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    community:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Community'
    },
    createdAt:{
        type:mongoose.Schema.Types.Date,
        default:Date.now
    },
    parentId:{
        type:String
    },
    children:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Thread'
    }]
})

export type Thread = InferSchemaType<typeof threadSchema> & {_id:string,id:string};


const ThreadModel = mongoose.models.Thread || mongoose.model<Thread>('Thread',threadSchema)

export default ThreadModel