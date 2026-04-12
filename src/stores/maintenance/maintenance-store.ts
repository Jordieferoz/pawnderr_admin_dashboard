// stores/maintenance/maintenance-store.ts
import { fetchMaintenanceStatus, setMaintenanceMode } from "@utils/api";
import { toast } from "sonner";
import { create } from "zustand";

interface MaintenanceStore {
  enabled: boolean;
  isLoading: boolean;
  isToggling: boolean;
  fetch: () => Promise<void>;
  toggle: (enabled: boolean) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  enabled: false,
  isLoading: true,
  isToggling: false,

  fetch: async () => {
    try {
      const resp = await fetchMaintenanceStatus();
      set({ enabled: resp.data?.data?.enabled ?? false });
    } catch {
      toast.error("Failed to fetch maintenance status");
    } finally {
      set({ isLoading: false });
    }
  },

  toggle: async (checked: boolean) => {
    set({ isToggling: true, enabled: checked }); // optimistic
    try {
      await setMaintenanceMode({ enabled: checked });
      toast.success(
        checked ? "Maintenance mode enabled" : "Maintenance mode disabled",
      );
    } catch {
      set({ enabled: !checked }); // rollback
      toast.error("Failed to update maintenance mode");
    } finally {
      set({ isToggling: false });
    }
  },
}));
