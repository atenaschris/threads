import mongoose, {Schema,  InferSchemaType }  from "mongoose";

export interface IUser {
    id:string;
    _id:string;
    username: string;
    name: string;
    image: string;
    bio:string;
    threads?:any[];
    onBoarded:boolean;
    communities?:any[]
  }

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

type User = InferSchemaType<typeof userSchema>;


const UserModel = mongoose.models.User<User> || mongoose.model<User>('User',userSchema)

export default UserModel