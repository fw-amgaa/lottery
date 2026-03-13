"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import type { LotteryItem } from "@/lib/lottery-items";
import { UploadButton } from "@/utils/uploadthing";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { insertLotteryItem, updateLotteryItem } from "./actions";

interface Props {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedItem: LotteryItem | null;
}

export default function LotteryItemDialog({
  isDialogOpen,
  setIsDialogOpen,
  selectedItem,
}: Props) {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const isEditing = !!selectedItem;

  React.useEffect(() => {
    if (isDialogOpen) {
      setUploadedImage(selectedItem?.image_url ?? null);
    }
  }, [isDialogOpen, selectedItem]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      total_tickets: Number(formData.get("total_tickets")),
      google_sheet_url: (formData.get("google_sheet_url") as string)
        ? `https://${(formData.get("google_sheet_url") as string).replace(/^https?:\/\//, "")}`
        : null,
      facebook_url: (formData.get("facebook_url") as string)
        ? `https://${(formData.get("facebook_url") as string).replace(/^https?:\/\//, "")}`
        : null,
      image_url: uploadedImage,
    };

    try {
      if (isEditing) {
        await updateLotteryItem(selectedItem.id, data);
        toast.success("Сугалаа шинэчлэгдлээ");
      } else {
        await insertLotteryItem(data);
        toast.success("Сугалаа амжилттай үүслээ");
      }
      setIsDialogOpen(false);
    } catch {
      toast.error("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEditing ? "Сугалаа засах" : "Сугалаа үүсгэх"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isEditing && selectedItem.code
              ? `Сугалааны код: ${selectedItem.code} — гүйлгээний утганд ашиглана`
              : "Өвөрмөц код автоматаар үүснэ"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {uploadedImage ? (
              <div className="relative aspect-video w-full max-h-[180px] overflow-hidden rounded-lg">
                <Image
                  src={uploadedImage}
                  alt="Uploaded"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => setUploadedImage(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  toast.success("Амжилттай байршуулсан");
                  setUploadedImage(res[0].ufsUrl);
                }}
                onUploadError={(error: Error) => {
                  toast.error(`ERROR! ${error.message}`);
                }}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Сугалааны нэр</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Нэр оруулах"
                  defaultValue={selectedItem?.name ?? ""}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="price">Үнэ (₮)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="10000"
                  defaultValue={selectedItem?.price ?? ""}
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="total_tickets">Нийт тасалбар</FieldLabel>
              <Input
                id="total_tickets"
                name="total_tickets"
                type="number"
                placeholder="1000"
                defaultValue={selectedItem?.total_tickets ?? ""}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="google_sheet_url">Google Sheet Url</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="google_sheet_url"
                  name="google_sheet_url"
                  placeholder="sheets.google.com"
                  defaultValue={selectedItem?.google_sheet_url?.replace(/^https?:\/\//, "") ?? ""}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/^https?:\/\//, "");
                  }}
                />
                <InputGroupAddon>
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="facebook_url">Facebook Url</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="facebook_url"
                  name="facebook_url"
                  placeholder="facebook.com"
                  defaultValue={selectedItem?.facebook_url?.replace(/^https?:\/\//, "") ?? ""}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/^https?:\/\//, "");
                  }}
                />
                <InputGroupAddon>
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-4">
            <Field orientation="horizontal">
              <Button type="submit" disabled={loading}>
                {loading
                  ? isEditing
                    ? "Шинэчилж байна..."
                    : "Үүсгэж байна..."
                  : isEditing
                    ? "Шинэчлэх"
                    : "Үүсгэх"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Цуцлах
              </Button>
            </Field>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
