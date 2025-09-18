import React from 'react';
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

interface SubTab {
  label: string;
  path: string;
  badge?: string;
}

interface HorizontalTabBarProps {
  subtabs: SubTab[];
  activeMainTab: string;
}

const HorizontalTabBar = ({ subtabs, activeMainTab }: HorizontalTabBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!subtabs || subtabs.length === 0) {
    return null;
  }

  const isActiveSubtab = (path: string) => location.pathname === path;

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {subtabs.map((subtab, index) => (
            <Button
              key={index}
              variant={isActiveSubtab(subtab.path) ? "default" : "ghost"}
              onClick={() => navigate(subtab.path)}
              className={cn(
                "h-9 px-4 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/20 whitespace-nowrap",
                isActiveSubtab(subtab.path)
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {subtab.label}
              {subtab.badge && (
                <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                  {subtab.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalTabBar;