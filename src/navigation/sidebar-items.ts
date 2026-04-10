import {
  CircleDollarSign,
  LayoutDashboard,
  PawPrint,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Users",
        url: "/users",
        icon: Users,
      },
      {
        title: "Pets",
        url: "/pets",
        icon: PawPrint,
      },
      {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: CircleDollarSign,
      },
    ],
  },
];
