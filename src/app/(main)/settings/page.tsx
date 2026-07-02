"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionManualModeStore } from "@/stores/subscription-manual-mode/subscription-manual-mode-store";
import { useMaintenanceStore } from "@/stores/maintenance/maintenance-store";
import { Calendar, CreditCard, Loader2, Save, ServerCog, ShieldAlert, User } from "lucide-react";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const manualModeStore = useSubscriptionManualModeStore();
  const maintenanceStore = useMaintenanceStore();

  // Local state for edits
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");

  // Sync state once fetched
  useEffect(() => {
    manualModeStore.fetch();
    maintenanceStore.fetch();
  }, []);

  useEffect(() => {
    setEnabled(manualModeStore.enabled);
    setMessage(manualModeStore.message);
  }, [manualModeStore.enabled, manualModeStore.message]);

  const hasChanges =
    enabled !== manualModeStore.enabled ||
    message !== manualModeStore.message;

  const handleSaveManualMode = async () => {
    try {
      await manualModeStore.updateSettings(enabled, message);
    } catch (e) {
      // Revert local state to store value on error
      setEnabled(manualModeStore.enabled);
      setMessage(manualModeStore.message);
    }
  };

  return (
    <div className="@container/main flex flex-col gap-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure application systems, payment gateways, and maintenance mode.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Subscription Manual Mode Card */}
        <Card className="border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-lg p-2.5 ${enabled ? "bg-violet-500/10" : "bg-muted"}`}>
                <CreditCard className={`size-5 ${enabled ? "text-violet-500" : "text-muted-foreground"}`} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Subscription Manual Mode</CardTitle>
                <CardDescription className="mt-0.5">
                  Configure whether user subscriptions are processed automatically via payments or manually.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {manualModeStore.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                {/* Active Toggle */}
                <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="manual-mode-toggle" className="text-sm font-medium cursor-pointer">
                      Enable Manual Subscriptions
                    </Label>
                    <p className="text-xs text-muted-foreground leading-normal">
                      When enabled, Razorpay payments are blocked. Admins can grant or revoke subscriptions manually.
                    </p>
                  </div>
                  <Switch
                    id="manual-mode-toggle"
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    className="data-[state=checked]:bg-violet-500"
                  />
                </div>

                {/* Conditional Message Setting */}
                {enabled && (
                  <div className="space-y-2.5 transition-all duration-200 ease-in-out">
                    <div className="space-y-1">
                      <Label htmlFor="manual-mode-msg" className="text-sm font-medium">
                        User Notification Message
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        This text is shown to mobile and web clients attempting to purchase a premium subscription.
                      </p>
                    </div>
                    <Textarea
                      id="manual-mode-msg"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g., Subscriptions are currently managed offline. Please contact the administrator to upgrade your plan."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                )}

                {/* Audit details if they exist */}
                {(manualModeStore.updatedBy || manualModeStore.updatedAt) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-dashed bg-muted/10 p-3 text-xs text-muted-foreground">
                    {manualModeStore.updatedBy && (
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span>Last updated by: <strong>{manualModeStore.updatedBy}</strong></span>
                      </div>
                    )}
                    {manualModeStore.updatedAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>Date: <strong>{formatDate(manualModeStore.updatedAt)}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>

          {!manualModeStore.isLoading && (
            <CardFooter className="border-t bg-muted/10 px-6 py-3 flex items-center justify-end gap-3">
              {hasChanges && (
                <span className="text-xs text-muted-foreground italic">
                  You have unsaved changes
                </span>
              )}
              <Button
                size="sm"
                onClick={handleSaveManualMode}
                disabled={!hasChanges || manualModeStore.isUpdating}
                className="h-8"
              >
                {manualModeStore.isUpdating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Maintenance Mode Card */}
        <Card className="border bg-card shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className={`rounded-lg p-2.5 ${maintenanceStore.enabled ? "bg-amber-500/10" : "bg-muted"}`}>
                <ServerCog className={`size-5 ${maintenanceStore.enabled ? "text-amber-500" : "text-muted-foreground"}`} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Maintenance Mode</CardTitle>
                <CardDescription className="mt-0.5">
                  Temporarily disable access to all public features and client applications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {maintenanceStore.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode-toggle" className="text-sm font-medium cursor-pointer">
                      Activate Maintenance Mode
                    </Label>
                    <p className="text-xs text-muted-foreground leading-normal">
                      When enabled, all APIs return a downtime/maintenance page and users will not be able to log in or use the application.
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode-toggle"
                    checked={maintenanceStore.enabled}
                    onCheckedChange={maintenanceStore.toggle}
                    disabled={maintenanceStore.isToggling}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>

                {maintenanceStore.enabled && (
                  <div className="flex items-start gap-2.5 rounded-md bg-amber-500/15 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <ShieldAlert className="size-4 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <span className="font-semibold">Attention:</span> Maintenance is currently active. Mobile and web applications are blocked for all non-admin users.
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
