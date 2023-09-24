import {ClerkProvider} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import '../globals.css'

export const metadata = {
    title:'Threads',
    description:'Next.js MEta Threads Application'
}

const inter = Inter({subsets:['latin']})

export default function RootLayout({
    children
}:{
    children:React.ReactNode
}) {
    return (
        <ClerkProvider >
            <html lang="en">
                <body className={`${inter.className} mx-auto max-w-3xl flex flex-col justify-center items-center px-10 py-20 bg-dark-1`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    )
}

