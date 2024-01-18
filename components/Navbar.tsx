import React from 'react'
import { Button } from './ui/button'
import { UserButton } from '@clerk/nextjs'
import MobileSidebar from './Mobile-Sidebar'
import { getApiLimitCount } from '@/lib/api-limit'
import { checkSubscription } from '@/lib/subscription'

const Navbar = async() => {
  
  const apiLimitCount = await getApiLimitCount()
  const subscription = await checkSubscription()
  

  return (
    <div className='flex items-center p-4'>
        <Button variant='ghost' size='icon' className='md:hidden'>
            <MobileSidebar subscription={subscription} apiLimitCount={apiLimitCount} />
        </Button>
        <div className='flex w-full justify-end'>
            <UserButton afterSignOutUrl='/' />
        </div>
    </div>
  )
}

export default Navbar