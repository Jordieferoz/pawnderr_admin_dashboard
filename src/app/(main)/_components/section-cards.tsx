"use client";

import {
  ChevronRight,
  CreditCard,
  PawPrint,
  ServerCog,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useMaintenanceStore } from "@/stores/maintenance/maintenance-store";

const navCards = [
  {
    key: "users",
    title: "User Management",
    description: "View, edit, and manage all registered users and their roles.",
    icon: Users,
    href: "/users",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "pets",
    title: "Pets Management",
    description: "Browse and manage pet profiles, photos, and matching data.",
    icon: PawPrint,
    href: "/pets",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "subscriptions",
    title: "Subscriptions",
    description:
      "Track active plans, billing history, and subscription statuses.",
    icon: CreditCard,
    href: "/subscriptions",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

export function SectionCards() {
  const router = useRouter();

  const {
    enabled: maintenanceEnabled,
    isLoading,
    isToggling,
    fetch,
    toggle,
  } = useMaintenanceStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4">
      {navCards.map(
        ({ key, title, description, icon: Icon, href, color, bg }) => (
          <Card
            key={key}
            className="@container/card group relative cursor-pointer overflow-hidden bg-linear-to-t from-primary/5 to-card shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:bg-card"
            onClick={() => router.push(href)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && router.push(href)}
          >
            <CardHeader className="pb-4">
              <div className={`mb-3 w-fit rounded-lg p-2.5 ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm leading-snug">
                    {description}
                  </CardDescription>
                </div>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
              </div>
            </CardHeader>
          </Card>
        ),
      )}

      {/* Maintenance Mode Card */}
      <Card className="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
        <CardHeader className="pb-4">
          <div
            className={`mb-3 w-fit rounded-lg p-2.5 ${maintenanceEnabled ? "bg-amber-500/10" : "bg-muted"}`}
          >
            <ServerCog
              className={`size-5 ${maintenanceEnabled ? "text-amber-500" : "text-muted-foreground"}`}
            />
          </div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">
                Maintenance Mode
              </CardTitle>
              <CardDescription className="mt-1 text-sm leading-snug">
                {maintenanceEnabled
                  ? "App is in maintenance. Users see a downtime page."
                  : "Toggle to put the app into maintenance mode for all users."}
              </CardDescription>
            </div>
            {isLoading ? (
              <Skeleton className="mt-0.5 h-5 w-9 shrink-0 rounded-full" />
            ) : (
              <Switch
                id="maintenance-toggle"
                checked={maintenanceEnabled}
                onCheckedChange={toggle}
                disabled={isToggling}
                className="mt-0.5 shrink-0 data-[state=checked]:bg-amber-500"
              />
            )}
          </div>
          {maintenanceEnabled && (
            <p className="mt-2 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              ⚠ Maintenance active — users cannot access the app
            </p>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
