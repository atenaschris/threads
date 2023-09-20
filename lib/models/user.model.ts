import mongoose, {Schema,  InferSchemaType }  from "mongoose";


const userSchema = new Schema({
    id:{type:String,required:true},
    username:{type:String, unique:true},
    name:{type:String,required:true},
    image:String,
    bio:String,
    threads:[{
        type:Schema.Types.ObjectId,
        ref:'Thread'
    }],
    onBoarded:{
        type:Boolean,
        default:false
    },
    communities:[{ 
        type:Schema.Types.ObjectId,
        ref:'Community'
    }],
})

export type User = InferSchemaType<typeof userSchema> & {_id:string};


const UserModel = mongoose.models.User || mongoose.model<User>('User',userSchema)

export default UserModel