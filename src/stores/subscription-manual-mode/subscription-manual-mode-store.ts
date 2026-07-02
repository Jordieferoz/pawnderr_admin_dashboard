// stores/subscription-manual-mode/subscription-manual-mode-store.ts
import { fetchSubscriptionManualMode, setSubscriptionManualMode } from "@utils/api";
import { toast } from "sonner";
import { create } from "zustand";

interface SubscriptionManualModeStore {
  enabled: boolean;
  message: string;
  updatedBy: string | null;
  updatedAt: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  fetch: () => Promise<void>;
  updateSettings: (enabled: boolean, message?: string) => Promise<void>;
}

export const useSubscriptionManualModeStore = create<SubscriptionManualModeStore>((set) => ({
  enabled: false,
  message: "",
  updatedBy: null,
  updatedAt: null,
  isLoading: true,
  isUpdating: false,

  fetch: async () => {
    try {
      const resp = await fetchSubscriptionManualMode();
      const data = resp.data?.data ?? resp.data;
      set({
        enabled: data?.enabled ?? false,
        message: data?.message ?? "",
        updatedBy: data?.updated_by ?? null,
        updatedAt: data?.updated_at ?? null,
      });
    } catch {
      toast.error("Failed to fetch subscription manual mode settings");
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (enabled: boolean, message?: string) => {
    set({ isUpdating: true });
    try {
      const resp = await setSubscriptionManualMode({ enabled, message });
      const data = resp.data?.data ?? resp.data;
      set({
        enabled: data?.enabled ?? enabled,
        message: data?.message ?? (message || ""),
        updatedBy: data?.updated_by ?? null,
        updatedAt: data?.updated_at ?? null,
      });
      toast.success(
        enabled
          ? "Subscription manual mode enabled successfully"
          : "Subscription manual mode disabled successfully"
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update subscription manual mode");
      throw err;
    } finally {
      set({ isUpdating: false });
    }
  },
}));
