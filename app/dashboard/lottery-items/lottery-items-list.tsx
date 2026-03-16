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
  Facebook02FreeIcons,
  Archive01Icon,
  ArrowReloadHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import LotteryItemDialog from "./dialog";
import Image from "next/image";
import {
  deleteLotteryItem,
  archiveLotteryItem,
  unarchiveLotteryItem,
} from "./actions";
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
  const [archiving, setArchiving] = React.useState<string | null>(null);

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
      toast.success("Сугалаа устгагдлаа");
    } catch {
      toast.error("Устгаж чадсангүй");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleArchive(item: LotteryItem) {
    setArchiving(item.id);
    try {
      if (item.archived) {
        await unarchiveLotteryItem(item.id);
        toast.success("Сугалаа сэргээгдлээ");
      } else {
        await archiveLotteryItem(item.id);
        toast.success("Сугалаа дууссан төлөвт шилжлээ");
      }
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setArchiving(null);
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
            <EmptyTitle>Сугалаа байхгүй</EmptyTitle>
            <EmptyDescription>
              Анхны сугалаагаа үүсгэж эхэлнэ үү.
            </EmptyDescription>
            <Button onClick={handleCreate}>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Сугалаа үүсгэх
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
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          Сугалаа үүсгэх
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className={`relative w-full max-w-sm overflow-hidden pt-0 mx-auto ${item.archived ? "opacity-70" : ""}`}
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
              {item.archived && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Дууссан
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{item.name}</CardTitle>
                {item.archived && (
                  <Badge
                    variant="outline"
                    className="shrink-0 text-muted-foreground"
                  >
                    Дууссан
                  </Badge>
                )}
              </div>
              {!item.archived && item.code && (
                <Badge variant="outline" className="font-mono w-fit">
                  {item.code}
                </Badge>
              )}
              <CardDescription>
                {item.sold_tickets} / {item.total_tickets} тасалбар зарагдсан
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
                {item.google_sheet_url && (
                  <Link href={item.google_sheet_url} target="_blank">
                    <Badge variant="secondary">
                      <HugeiconsIcon icon={GoogleSheetIcon} strokeWidth={2} />
                      Sheets
                    </Badge>
                  </Link>
                )}
                {item.facebook_url && (
                  <Link href={item.facebook_url} target="_blank">
                    <Badge variant="secondary">
                      <HugeiconsIcon
                        icon={Facebook02FreeIcons}
                        strokeWidth={2}
                      />
                      Facebook
                    </Badge>
                  </Link>
                )}
              </Field>
            </CardContent>

            <CardFooter>
              <Field
                orientation="horizontal"
                className="justify-between w-full"
              >
                <Button onClick={() => handleEdit(item)}>
                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                  Засах
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleArchive(item)}
                  disabled={archiving === item.id}
                >
                  <HugeiconsIcon
                    icon={
                      item.archived ? ArrowReloadHorizontalIcon : Archive01Icon
                    }
                    strokeWidth={2}
                  />
                  {archiving === item.id
                    ? "..."
                    : item.archived
                      ? "Сэргээх"
                      : "Дуусгах"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteTarget(item)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
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
            <AlertDialogTitle>Сугалаа устгах</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot; устгахдаа итгэлтэй байна уу? Энэ
              үйлдлийг буцааж болохгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Устгаж байна..." : "Устгах"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
