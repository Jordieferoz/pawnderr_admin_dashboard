"use client";

import { useEffect, useState } from "react";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { authLogout, authMe } from "@utils/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

export function ProfileDropdown() {
  const [activeUser, setActiveUser] = useState({
    name: "Loading...",
    email: "",
    avatar: "",
    role: "admin",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await authMe();

        if (response.statusCode && response?.data.data) {
          setActiveUser({
            name: response.data.data.name,
            email: response.data.data.email,
            avatar: "", // Add logic if avatar comes from api later
            role: "administrator",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    }
    fetchUser();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-full">
          <AvatarImage
            src={activeUser.avatar || undefined}
            alt={activeUser.name}
          />
          <AvatarFallback className="rounded-full">
            {getInitials(activeUser.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 space-y-1 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem
          key={activeUser.email || "current"}
          className={cn("p-0")}
        >
          <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
            <Avatar className="size-9 rounded-lg">
              <AvatarImage
                src={activeUser.avatar || undefined}
                alt={activeUser.name}
              />
              <AvatarFallback className="rounded-full">
                {getInitials(
                  activeUser.name !== "Loading..." ? activeUser.name : "US",
                )}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeUser.name}</span>
              <span className="truncate text-xs">{activeUser.email}</span>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          onClick={async () => {
            try {
              await authLogout();
            } catch (error) {
              console.error(error);
            }
            signOut({ callbackUrl: "/auth/login" });
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
