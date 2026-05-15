"use client";

import Link from "next/link";
import { Gamepad2, Star, Columns } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "検索", icon: Gamepad2 },
    { href: "/bookmarks", label: "お気に入り", icon: Star },
    { href: "/compare", label: "比較", icon: Columns },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-5xl mx-auto px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-primary neon-glow" />
            <span className="font-bold sm:inline-block hidden">
              ゲーム詳解<span className="text-primary neon-glow">AI</span>事典
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (pathname.startsWith('/result') && link.href === '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center transition-colors hover:text-foreground/80",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
