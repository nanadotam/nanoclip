"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
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
            <Link href="/about" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-6")}>
                About
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/how-it-works" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-6")}>
                How It Works
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact" legacyBehavior passHref>
              <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "px-6")}>
                Contact
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <ThemeToggle />
    </motion.div>
  )
}
