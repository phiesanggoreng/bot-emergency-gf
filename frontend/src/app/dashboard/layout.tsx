import { DashboardSidebarLayout } from "@/components/ui/dashboard-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardSidebarLayout>{children}</DashboardSidebarLayout>;
}
