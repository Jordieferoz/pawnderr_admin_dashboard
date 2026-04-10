"use client";

import { Command, ServerCog } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

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
import { toast } from "sonner";

import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import { fetchMaintenanceStatus, setMaintenanceMode } from "@utils/api";

import { NavMain } from "./NavMain";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const resp = await fetchMaintenanceStatus();
        setMaintenanceEnabled(resp.data?.data?.enabled ?? false);
      } catch (err) {
        toast.error("Failed to fetch maintenance status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);

    setMaintenanceEnabled(checked);
    try {
      await setMaintenanceMode({ enabled: checked });
      toast.success(
        checked ? "Maintenance mode enabled" : "Maintenance mode disabled",
      );
    } catch (err) {
      setMaintenanceEnabled(!checked);
      toast.error("Failed to update maintenance mode");
    } finally {
      setIsToggling(false);
    }
  };

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
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="data-[state=checked]:bg-amber-500"
            />
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
