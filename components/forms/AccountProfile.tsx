"use client"
import type { User } from '@clerk/backend';
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod'
import { UserValidation } from '@/lib/validations/user';
import * as z from 'zod'
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
import { Input } from "@/components/ui/input"
import Image from 'next/image';
import { ChangeEvent } from 'react';

type AccountProfileUser = Pick<User,'id'|'username'|'firstName'|'imageUrl'> & {
    objectId?:string;
    bio?:string
}

interface AccountProfileProps {
    user: AccountProfileUser ;
    btnTitle:string;
}

const AccountProfile = ({user,btnTitle}:AccountProfileProps) => {

    function onSubmit(values: z.infer<typeof UserValidation>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }
    
  const handleImage = (onChange: (...event: any[]) => void) => (e:ChangeEvent) => {
    e.preventDefault();
  }

    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues:{
            profile_photo:'',
            name:'',
            username:'',
            bio:''
        }
    });
    return (
        <Form {...form}>
        <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="flex flex-col justify-start gap-10">
          <FormField
            control={form.control}
            name="profile_photo"
            render={({ field }) => (
              <FormItem className='flex items-center gap-4'>
                <FormLabel className='account-form_image-label'>
                    {field.value ? (
                        <Image 
                            src={field.value} 
                            alt='profile photo' 
                            width={96} height={96} 
                            priority 
                            className='rounded-full object-contain'
                        />
                    ) : (
                        <Image 
                            src={'/assets/profile.svg'} 
                            alt='profile photo' 
                            width={24} 
                            height={24} 
                            priority 
                            className='object-contain'
                        />
                    )}
                </FormLabel>
                <FormControl className='flex-1 text-base-semibold text-gray-200'>
                  <Input 
                    type='file' 
                    accept='image/*' 
                    placeholder='Upload a photo' 
                    className='account-form-image-input'
                    onChange={handleImage(field.onChange)}
                     />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    )
}

export default AccountProfile