"use client"

import * as z from 'zod'
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod'


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Input } from '../ui/input';
import { CommentValidation } from '@/lib/validations/Comment';
import Image from 'next/image';
import { addCommentToThread } from '@/lib/actions/thread.actions';

interface CommentProps {
    threadId:string;
    currentDbSavedUserImg:string;
    currentUserId:string
}


const Comment = ({threadId,currentDbSavedUserImg,currentUserId}:CommentProps) => {
    const pathname = usePathname();
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues:{
            thread:''
        }
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        try{
          await addCommentToThread(
            threadId,
            values.thread,
            JSON.parse(currentUserId),
            pathname
          )
  
          form.reset();
          
        } catch(err:any){
          console.log(err.message)
        }
       
    }
    return (
        <Form {...form}>
        <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="comment-form">
          <FormField
            control={form.control}
            name="thread"
            render={({ field }) => (
              <FormItem className='flex items-center gap-3 w-full'>
                <FormLabel className='text-base-semibold text-light-2'>
                    <Image 
                        src={currentDbSavedUserImg} 
                        alt="Profile Image" 
                        width={48} 
                        height={48}
                        className='rounded-full object-cover'
                    />
                </FormLabel>
                <FormControl className='border-none bg-transparent'>
                  <Input 
                   placeholder='Comment...'
                   className='no-focus text-light-1 outline-none'
                    {...field}
                     />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className='comment-form_btn'>Post Thread</Button>
        </form>
      </Form>
    )
}

export default Comment