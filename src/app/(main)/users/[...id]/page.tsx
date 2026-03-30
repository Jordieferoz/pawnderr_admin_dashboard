"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blockUser, fetchUserDetails, unBlockUser } from "@utils/api";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Crown,
  Loader2,
  LogIn,
  Mail,
  Phone,
  ShieldAlert,
  ShieldOff,
  User,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface UserDetail {
  id: number;
  email: string;
  phone: string;
  auth_type: string;
  name: string;
  gender: "male" | "female" | "prefer_not_to_say";
  is_active: boolean;
  is_verified: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

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

function formatGender(gender: UserDetail["gender"]) {
  switch (gender) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "prefer_not_to_say":
      return "Prefer not to say";
    default:
      return gender;
  }
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium break-all">{value}</div>
      </div>
    </div>
  );
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id } = use(params);
  const userId = Number(id[0]);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isNaN(userId)) {
      setError("Invalid user ID.");
      setLoading(false);
      return;
    }
    fetchUserDetails(userId)
      .then((res) => {
        const data = res?.data?.data ?? res?.data;
        setUser(data);
      })
      .catch(() => setError("Failed to load user details."))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleBlockToggle() {
    if (!user) return;
    setActionLoading(true);
    try {
      if (user.is_active) {
        await blockUser(userId);
      } else {
        await unBlockUser(userId);
      }
      // Optimistically toggle is_active
      setUser((prev) =>
        prev ? { ...prev, is_active: !prev.is_active } : prev,
      );
    } catch {
      // No-op: keep existing state on failure
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6 ">
      {/* Back nav */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 -ml-2 text-muted-foreground"
          asChild
        >
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
            Users
          </Link>
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading user…</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border bg-card p-8 text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && user && (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Profile card */}
          <div className="sm:col-span-1 rounded-xl border bg-card shadow-sm flex flex-col items-center gap-3 p-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-3xl font-semibold text-muted-foreground select-none">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold">{user.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                #{user.id} · {formatGender(user.gender)}
              </p>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <Badge variant={user.is_active ? "default" : "destructive"}>
                {user.is_active ? "Active" : "Blocked"}
              </Badge>
              <Badge variant={user.is_verified ? "default" : "secondary"}>
                {user.is_verified ? "Verified" : "Unverified"}
              </Badge>
              {user.is_premium && (
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                  Premium
                </Badge>
              )}
            </div>

            {/* Block / Unblock action */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={user.is_active ? "destructive" : "outline"}
                  size="sm"
                  className="mt-2 w-full gap-1.5"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldOff className="h-3.5 w-3.5" />
                  )}
                  {user.is_active ? "Block User" : "Unblock User"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    {user.is_active ? "Block" : "Unblock"} {user.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.is_active
                      ? "This will prevent the user from accessing the platform. You can unblock them at any time."
                      : "This will restore the user's access to the platform."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBlockToggle}
                    className={
                      user.is_active
                        ? "bg-destructive hover:bg-destructive/90"
                        : ""
                    }
                  >
                    {user.is_active ? "Block" : "Unblock"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Details card */}
          <div className="sm:col-span-2 rounded-xl border bg-card shadow-sm p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Details
            </h2>

            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={<span className="font-mono">{user.phone}</span>}
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Auth Type"
              value={
                <Badge variant="outline" className="capitalize">
                  {user.auth_type}
                </Badge>
              }
            />
            <InfoRow
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Verification"
              value={
                user.is_verified ? (
                  <span className="text-emerald-600">Verified</span>
                ) : (
                  <span className="text-muted-foreground">Not verified</span>
                )
              }
            />
            <InfoRow
              icon={<Crown className="h-4 w-4" />}
              label="Premium"
              value={
                user.is_premium
                  ? `Yes — expires ${formatDate(user.premium_expires_at)}`
                  : "No"
              }
            />
            <InfoRow
              icon={<LogIn className="h-4 w-4" />}
              label="Logins"
              value={`${user.login_count} time${user.login_count !== 1 ? "s" : ""} · Last: ${formatDate(user.last_login_at)}`}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Joined"
              value={formatDate(user.created_at)}
            />
            {user.deleted_at && (
              <InfoRow
                icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
                label="Deleted at"
                value={
                  <span className="text-destructive">
                    {formatDate(user.deleted_at)}
                  </span>
                }
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
