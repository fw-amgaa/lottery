"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/lottery-items": "Lottery Items",
  "/dashboard/transactions": "Transactions",
  "/dashboard/purchases": "Purchases",
};

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Dashboard";
  const isOverview = pathname === "/dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!isOverview && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Overview</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
