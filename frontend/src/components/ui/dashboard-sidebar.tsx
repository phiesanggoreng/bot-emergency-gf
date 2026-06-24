"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Activity,
  Bell,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  path?: string;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const navGroups: NavGroupData[] = [
  {
    items: [
      { id: 'home', title: 'Check-in', icon: LayoutDashboard, path: '/dashboard' },
      { id: 'history', title: 'Riwayat', icon: Activity, path: '/dashboard/history' },
      { id: 'notifications', title: 'Log Notifikasi', icon: Bell, path: '/dashboard/notifications' },
    ]
  },
  {
    heading: 'Pengaturan',
    items: [
      { id: 'contacts', title: 'Kontak Telegram', icon: Users, path: '/dashboard/contacts' },
      { id: 'settings', title: 'Pengaturan Bot', icon: Settings, path: '/dashboard/settings' },
    ]
  }
];

const bottomItems: NavItemData[] = [
  { id: 'logout', title: 'Log out', icon: LogOut },
];

function WorkspaceSwitcher({ userName }: { userName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const current = userName || "User";

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-2 mb-4 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-primary text-primary-foreground flex items-center justify-center font-semibold text-[13px] shadow-sm uppercase">
            {current.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] font-medium leading-none mb-1 text-foreground truncate max-w-[120px]">{current}</span>
            <span className="text-[11px] text-muted-foreground leading-none">Personal Plan</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors shrink-0" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (item: NavItemData) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive 
            ? 'bg-black/5 dark:bg-white/10 text-foreground font-medium' 
            : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground/90'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors
              ${isActive ? 'text-foreground' : 'text-muted-foreground/70 group-hover:text-foreground/70'}
            `} 
            strokeWidth={1.5} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-muted-foreground/60 bg-background/50 border border-border/50 rounded-[4px] shadow-xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ 
  className = '',
  activeId,
  onSelect,
  userName
}: { 
  className?: string,
  activeId: string,
  onSelect: (item: NavItemData) => void,
  userName?: string
}) {
  return (
    <div className={`flex flex-col w-[260px] h-full bg-card border-r border-border/50 p-3 font-sans ${className}`}>
      <WorkspaceSwitcher userName={userName} />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
        {navGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/50 uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={activeId} 
                onSelect={onSelect} 
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-0.5">
        {bottomItems.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={activeId} 
            onSelect={onSelect} 
          />
        ))}
      </div>
    </div>
  );
}

const allItems = [...navGroups.flatMap(g => g.items), ...bottomItems];
const flattenItems = (items: NavItemData[]): NavItemData[] => {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flattenItems(item.children));
    return acc;
  }, [] as NavItemData[]);
};
const flatNavData = flattenItems(allItems);

export function DashboardSidebarLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Redirect to home if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="animate-pulse">Loading...</p></div>;
  }

  if (!session) return null;

  // Find active id based on pathname
  const activeItem = flatNavData.find(i => i.path === pathname) || flatNavData[0];
  const activeId = activeItem.id;
  const activeTitle = activeItem.title;

  const handleSelect = (item: NavItemData) => {
    if (item.id === 'logout') {
      signOut({ callbackUrl: "/" });
      return;
    }
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background">
      <div className="relative w-full h-screen bg-background flex overflow-hidden">
        
        {/* Sidebar */}
        <div 
          className={`h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-card/50 border-r border-border/50 ${
            isOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-none'
          }`}
        >
          <SidebarNav 
            className="w-[260px] border-none bg-transparent" 
            activeId={activeId}
            onSelect={handleSelect}
            userName={session.user?.name || "User"}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col min-w-0 transition-all duration-300 relative">
           
           {/* Top Header */}
           <div className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card/80 backdrop-blur-sm shrink-0 z-10 sticky top-0">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsOpen(!isOpen)}
                 className="p-1.5 rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
               >
                 {isOpen ? <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />}
               </button>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span className="truncate">Sweety Bot</span>
                 <span>/</span>
                 <span className="font-medium text-foreground truncate">{activeTitle}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               {session.user?.image ? (
                 <>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-primary/20" />
                 </>
               ) : (
                 <div className="w-8 h-8 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {session.user?.name?.charAt(0)}
                 </div>
               )}
             </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             {children}
           </div>
        </div>
      </div>
    </div>
  );
}
