"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wifi, Upload, Download, Info, Phone, HelpCircle, X } from "lucide-react";

const routes = [
  {
    name: "Upload",
    path: "/upload",
    icon: Upload,
  },
  {
    name: "Download",
    path: "/download",
    icon: Download,
  },
  {
    name: "AirShare",
    path: "/airshare",
    icon: Wifi,
  },
];

const moreLinks = [
  {
    name: "About",
    path: "/about",
    icon: Info,
    description: "Learn more about NanoClip",
  },
  {
    name: "Contact",
    path: "/contact",
    icon: Phone,
    description: "Get in touch with us",
  },
  {
    name: "How it Works",
    path: "/how-it-works",
    icon: HelpCircle,
    description: "Learn how to use NanoClip",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg">
            NanoClip
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {routes.map((route) => (
                <Link 
                  key={route.path} 
                  href={route.path}
                  className={cn(
                    "px-4 py-2 rounded-md flex items-center gap-2 hover:bg-accent transition-colors",
                    pathname === route.path && "bg-accent text-accent-foreground"
                  )}
                >
                  <route.icon className="w-4 h-4" />
                  {route.name}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="relative z-50"
            >
              <motion.div
                className="w-6 h-5 flex flex-col justify-between"
                initial={false}
              >
                <motion.span
                  className="w-full h-[2px] bg-foreground"
                  animate={{ 
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 9 : 0
                  }}
                />
                <motion.span
                  className="w-full h-[2px] bg-foreground"
                  animate={{ 
                    opacity: isMenuOpen ? 0 : 1
                  }}
                />
                <motion.span
                  className="w-full h-[2px] bg-foreground"
                  animate={{ 
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? -9 : 0
                  }}
                />
              </motion.div>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <div className="pt-24 px-4 pb-8">
              <div className="space-y-4">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-4 rounded-lg hover:bg-accent transition-colors",
                      pathname === route.path && "bg-accent text-accent-foreground"
                    )}
                  >
                    <route.icon className="w-5 h-5" />
                    <span>{route.name}</span>
                  </Link>
                ))}
                
                <div className="h-px bg-border my-4" />
                
                {moreLinks.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex flex-col gap-1 p-4 rounded-lg hover:bg-accent transition-colors",
                      pathname === item.path && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
