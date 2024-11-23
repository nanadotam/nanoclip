"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuContent, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/ThemeToggle"
import MobileMenu from '../MobileMenu';

export default function Navbar() {
  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      className="flex items-center justify-between w-full px-4 sm:px-6 md:px-8 lg:px-20 py-4"
    >
      <div className="md:hidden">
        <MobileMenu />
      </div>
      
      <Link href="/" className="font-mona-sans absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
        <motion.span 
          className="text-2xl font-black tracking-tight hover:text-primary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          NanoClip
        </motion.span>
      </Link>

      <NavigationMenu className="hidden md:flex space-x-4">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/upload" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-6")}>
                Upload
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <Link href="/download" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-6")}>
                Download
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="px-6">More</NavigationMenuTrigger>
            <NavigationMenuContent>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-[200px] p-2 bg-popover rounded-md shadow-lg"
              >
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    "block px-4 py-2 hover:bg-accent rounded-sm transition-colors",
                    "text-sm font-medium"
                  )}>
                    About
                  </NavigationMenuLink>
                </Link>
                <Link href="/how-it-works" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    "block px-4 py-2 hover:bg-accent rounded-sm transition-colors",
                    "text-sm font-medium"
                  )}>
                    How It Works
                  </NavigationMenuLink>
                </Link>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className={cn(
                    "block px-4 py-2 hover:bg-accent rounded-sm transition-colors",
                    "text-sm font-medium"
                  )}>
                    Contact
                  </NavigationMenuLink>
                </Link>
              </motion.div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <ThemeToggle />
    </motion.div>
  )
}
