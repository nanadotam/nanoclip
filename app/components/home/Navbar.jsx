"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Wifi, Upload, Download, Info, Phone, HelpCircle } from "lucide-react";

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

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          NanoClip
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {routes.map((route) => (
                <NavigationMenuItem key={route.path}>
                  <Link href={route.path} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-9 px-4 flex items-center gap-2",
                        pathname === route.path &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <route.icon className="w-4 h-4" />
                      {route.name}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9">
                  More
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {moreLinks.map((item) => (
                      <Link key={item.path} href={item.path} legacyBehavior passHref>
                        <NavigationMenuLink
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            pathname === item.path &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm font-medium leading-none">
                              {item.name}
                            </span>
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </NavigationMenuLink>
                      </Link>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            asChild
          >
            <Link href="/menu">
              <motion.div
                className="w-6 h-5 flex flex-col justify-between"
                initial={false}
              >
                <motion.span className="w-full h-[2px] bg-foreground" />
                <motion.span className="w-full h-[2px] bg-foreground" />
                <motion.span className="w-full h-[2px] bg-foreground" />
              </motion.div>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
