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
  "/dashboard": "Хяналт",
  "/dashboard/lottery-items": "Сугалаанууд",
  "/dashboard/transactions": "Гүйлгээнүүд",
  "/dashboard/purchases": "Худалдан авалтууд",
};

export default function DashboardBreadcrumb() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Хяналтын самбар";
  const isOverview = pathname === "/dashboard";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!isOverview && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Хяналт</BreadcrumbLink>
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
