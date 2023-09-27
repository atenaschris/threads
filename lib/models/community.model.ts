import mongoose, {Schema,  InferSchemaType }  from "mongoose";


const communitySchema = new Schema({
    id:{type:String,required:true},
    username:{type:String, unique:true},
    name:{type:String,required:true},
    image:String,
    bio:String,
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    threads:[{
        type:Schema.Types.ObjectId,
        ref:'Thread'
    }],
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
})

export type Community = InferSchemaType<typeof communitySchema> & {_id:string};


const CommunityModel = mongoose.models.Community || mongoose.model<Community>('Community',communitySchema)

export default CommunityModel