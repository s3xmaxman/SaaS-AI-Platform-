"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Menu } from 'lucide-react'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import Sidebar from './Sidebar'


interface MobileSidebarProps {
  apiLimitCount: number
  subscription: boolean
}


const MobileSidebar = ({ apiLimitCount = 0, subscription = false }: MobileSidebarProps) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

 
  return (
    <Sheet> 
        <SheetTrigger>
            <Button variant='ghost' size='icon' className='md:hidden'>
                <Menu />
            </Button>
        </SheetTrigger>
        <SheetContent side='left' className='p-0'>
            <Sidebar subscription={subscription} apiLimitCount={apiLimitCount} />
        </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar