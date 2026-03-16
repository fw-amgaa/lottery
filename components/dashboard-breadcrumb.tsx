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

const SEGMENT_LABELS: Record<string, string> = {
  "dashboard": "Хяналт",
  "lottery-items": "Сугалаанууд",
  "transactions": "Гүйлгээнүүд",
  "purchases": "Худалдан авалтууд",
  "contacts": "Хэрэглэгчид",
};

// For dynamic segments (UUIDs), map their parent to a label
const DYNAMIC_CHILD_LABELS: Record<string, string> = {
  "lottery-items": "Тасалбарын жагсаалт",
};

export default function DashboardBreadcrumb() {
  const pathname = usePathname();

  // segments after "dashboard": e.g. ["lottery-items", "abc-123"]
  const parts = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);

  if (parts.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Хяналт</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Single-level: /dashboard/lottery-items
  if (parts.length === 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">Хяналт</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{SEGMENT_LABELS[parts[0]] ?? parts[0]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Two-level: /dashboard/lottery-items/[id]
  const parentSegment = parts[0];
  const parentLabel = SEGMENT_LABELS[parentSegment] ?? parentSegment;
  const childLabel = DYNAMIC_CHILD_LABELS[parentSegment] ?? parts[1];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/dashboard">Хяналт</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={`/dashboard/${parentSegment}`}>{parentLabel}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{childLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
