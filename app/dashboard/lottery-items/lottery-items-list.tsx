"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { LotteryItem } from "@/lib/lottery-items";
import {
  PlusSignIcon,
  Ticket02Icon,
  Edit02Icon,
  Delete02Icon,
  GoogleSheetIcon,
  FacebookIcon,
  Facebook02FreeIcons,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import LotteryItemDialog from "./dialog";
import Image from "next/image";
import { deleteLotteryItem } from "./actions";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function LotteryItemsList({ items }: { items: LotteryItem[] }) {
  const [selectedItem, setSelectedItem] = React.useState<LotteryItem | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<LotteryItem | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  function handleCreate() {
    setSelectedItem(null);
    setIsDialogOpen(true);
  }

  function handleEdit(item: LotteryItem) {
    setSelectedItem(item);
    setIsDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLotteryItem(deleteTarget.id);
      toast.success("Lottery item deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Empty>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Ticket02Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyContent>
            <EmptyTitle>No lottery items</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first lottery item.
            </EmptyDescription>
            <Button onClick={handleCreate}>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Create Lottery Item
            </Button>
          </EmptyContent>
        </Empty>
        <LotteryItemDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          selectedItem={selectedItem}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="relative w-full max-w-sm overflow-hidden pt-0 mx-auto"
          >
            <div className="w-full h-[200px] relative">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="z-20 object-cover"
                />
              )}
            </div>

            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>
                {item.sold_tickets} / {item.total_tickets} tickets sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={(item.sold_tickets / item.total_tickets) * 100}
                prefix={`${Math.round((item.sold_tickets / item.total_tickets) * 100)}%`}
              />
              <Field orientation="horizontal" className="mt-4 justify-between">
                <Badge variant="secondary">
                  {item.price.toLocaleString()}₮
                </Badge>

                <Link href={item.google_sheet_url || "/"} target="_blank">
                  <Badge variant={"secondary"}>
                    <HugeiconsIcon icon={GoogleSheetIcon} strokeWidth={2} />
                    Sheets
                  </Badge>
                </Link>

                <Link href={item.facebook_url || "/"} target="_blank">
                  <Badge variant={"secondary"}>
                    <HugeiconsIcon icon={Facebook02FreeIcons} strokeWidth={2} />
                    Facebook
                  </Badge>
                </Link>
              </Field>
            </CardContent>
            <CardFooter>
              <Field orientation={"horizontal"} className="justify-between">
                <Button onClick={() => handleEdit(item)}>
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setDeleteTarget(item)}>
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  Delete
                </Button>
              </Field>
            </CardFooter>
          </Card>
        ))}
      </div>

      <LotteryItemDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedItem={selectedItem}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lottery item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
