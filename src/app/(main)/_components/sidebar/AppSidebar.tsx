"use client";

import { Command, ServerCog } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useShallow } from "zustand/react/shallow";

import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { useMaintenanceStore } from "@/stores/maintenance/maintenance-store";

import { NavMain } from "./NavMain";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const { enabled: maintenanceEnabled, isLoading, isToggling, fetch, toggle } =
    useMaintenanceStore();

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/">
                <Command />
                <span className="font-semibold text-base">
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-2 rounded-md border border-sidebar-border bg-sidebar-accent/40">
          <ServerCog className="size-4 text-muted-foreground shrink-0" />
          <Label
            htmlFor="maintenance-toggle"
            className="flex-1 text-sm cursor-pointer select-none"
          >
            Maintenance Mode
          </Label>
          {isLoading ? (
            <Skeleton className="h-5 w-9 rounded-full" />
          ) : (
            <Switch
              id="maintenance-toggle"
              checked={maintenanceEnabled}
              onCheckedChange={toggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-amber-500"
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
