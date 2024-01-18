import React from 'react'
import { Button } from './ui/button'
import { UserButton } from '@clerk/nextjs'
import MobileSidebar from './Mobile-Sidebar'
import { getApiLimitCount } from '@/lib/api-limit'

const Navbar = async() => {
  
  const apiLimitCount = await getApiLimitCount()
  

  return (
    <div className='flex items-center p-4'>
        <Button variant='ghost' size='icon' className='md:hidden'>
            <MobileSidebar apiLimitCount={apiLimitCount} />
        </Button>
        <div className='flex w-full justify-end'>
            <UserButton afterSignOutUrl='/' />
        </div>
    </div>
  )
}

export default Navbar