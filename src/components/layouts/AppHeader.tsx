import { useApp } from "@/providers/AppProvider";
import { Bell, HelpCircle, LogOut, MessageSquare, Search, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const [{ user }, { logout }] = useApp();
  const location = useLocation();

  return (
    <header className="flex h-[65px] items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-medium text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-48 rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 lg:w-64"
            onFocus={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
            }}
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-emerald-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center rounded-full p-2 text-gray-900 hover:bg-gray-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                <User className="h-5 w-5" />
              </div>
              <span className="hidden text-sm font-medium md:inline">{user?.full_name || "User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 border-gray-200 bg-white" align="end">
            <DropdownMenuLabel className="text-gray-900">
              {user?.full_name || "User"}
              <p className="text-xs font-normal text-gray-500">{user?.email || "user@example.com"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                <Link to="/settings/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Feedback</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem onClick={() => logout()} className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
