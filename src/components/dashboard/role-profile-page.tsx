"use client";

import { getApiErrorMessage } from "@/api";
import type { Resource } from "@/api/university.api";
import { universityApi } from "@/api/university.api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useGetMe } from "@/hooks";
import type { User, UserRole } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useEffect, useRef, useState } from "react";
import z from "zod";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const roleTitles: Record<UserRole, string> = {
  ADMIN: "Administrator",
  FACULTY: "Faculty member",
  STUDENT: "Student",
  USER: "University account",
};

function isRecord(value: unknown): value is Resource {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function relatedName(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "Not assigned";
  const name = value.name ?? value.title ?? value.code;
  return typeof name === "string" ? name : "Not assigned";
}

function ProfileValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function roleDetails(user: User): { label: string; value: string }[] {
  if (user.role === "STUDENT") {
    const student = user.studentProfile;
    return [
      { label: "Student ID", value: student?.studentId ?? "Not assigned" },
      { label: "Program", value: relatedName(student?.program) },
      { label: "Department", value: relatedName(student?.department) },
      {
        label: "Current semester",
        value: relatedName(student?.currentSemester),
      },
    ];
  }

  if (user.role === "FACULTY") {
    const faculty = user.facultyProfile;
    return [
      { label: "Employee ID", value: faculty?.employeeId ?? "Not assigned" },
      { label: "Designation", value: faculty?.designation ?? "Not assigned" },
      { label: "Department", value: relatedName(faculty?.department) },
    ];
  }

  if (user.role === "ADMIN") {
    return [
      { label: "Access level", value: "University administrator" },
      { label: "Account status", value: user.status.replaceAll("_", " ") },
    ];
  }

  return [
    { label: "Account status", value: user.status.replaceAll("_", " ") },
    { label: "Next step", value: "Contact your university for role access" },
  ];
}

export default function RoleProfilePage({ userRole }: { userRole: UserRole }) {
  const { data, isPending, isError, error } = useGetMe();
  const queryClient = useQueryClient();
  const imageInput = useRef<HTMLInputElement>(null);
  const user = data?.data;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone ?? "");
  }, [user]);

  const saveProfile = useMutation({
    mutationFn: (body: Resource) => universityApi.updateProfile(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.add({
        title: "Profile updated",
        description: "Your profile information has been saved.",
        type: "success",
      });
    },
    onError: (saveError) => {
      toast.add({
        title: "Could not update profile",
        description: getApiErrorMessage(saveError),
        type: "error",
      });
    },
  });

  const uploadImage = useMutation({
    mutationFn: universityApi.uploadProfileImage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.add({
        title: "Profile photo updated",
        description: "Your new profile photo is now visible.",
        type: "success",
      });
      if (imageInput.current) imageInput.current.value = "";
    },
    onError: (uploadError) => {
      toast.add({
        title: "Could not upload profile photo",
        description: getApiErrorMessage(uploadError),
        type: "error",
      });
      if (imageInput.current) imageInput.current.value = "";
    },
  });

  const UpdateMyProfileSchema = z
    .object({
      firstName: z.string().min(2).max(50),
      lastName: z.string().min(2).max(50),
      phone: z
        .string()
        .trim()
        .refine((val) => val === "" || /^(?:\+?880|0)1[3-9]\d{8}$/.test(val), {
          message: "Please provide valid Bangladeshi number",
        })
        .optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "At least one profile field is required",
    });

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationResult = UpdateMyProfileSchema.safeParse({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || null,
    });
    console.log("Validation result:", validationResult); // Debugging line

    if (!validationResult.success) {
      const errorMessages = validationResult.error?.issues?.map(
        (err) => err.message,
      ) ?? ["Invalid profile information."];
      toast.add({
        title: "Invalid profile information",
        description: errorMessages.join(" "),
        type: "error",
      });
      return;
    }

    saveProfile.mutate(validationResult.data);
  };

  const selectImage = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_PROFILE_IMAGE_TYPES.has(file.type)) {
      toast.add({
        title: "Unsupported image",
        description: "Choose a JPEG, PNG, or WebP image.",
        type: "error",
      });
      if (imageInput.current) imageInput.current.value = "";
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      toast.add({
        title: "Image is too large",
        description: "Profile photos must be 5 MB or smaller.",
        type: "error",
      });
      if (imageInput.current) imageInput.current.value = "";
      return;
    }
    uploadImage.mutate(file);
  };

  if (isPending) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading your profile…
        </div>
      </main>
    );
  }

  if (isError || !user) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile unavailable</CardTitle>
            <CardDescription>{getApiErrorMessage(error)}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (user.role !== userRole) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile access unavailable</CardTitle>
            <CardDescription>
              Your account does not match this role-specific profile page.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() ||
    "U";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-sm font-medium text-primary">
            {roleTitles[userRole]}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            My profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your university account and profile photo.
          </p>
        </header>

        <Card>
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
            <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-semibold text-primary">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${fullName}'s profile photo`}
                  fill
                  sizes="112px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold">
                {fullName || "University member"}
              </h2>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {user.email}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {roleTitles[userRole]}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <input
                ref={imageInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Choose a profile photo"
                onChange={(event) =>
                  selectImage(event.currentTarget.files?.[0])
                }
                disabled={uploadImage.isPending}
              />
              <Button
                type="button"
                onClick={() => imageInput.current?.click()}
                disabled={uploadImage.isPending}
              >
                {uploadImage.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                {uploadImage.isPending ? "Uploading…" : "Update photo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, or WebP · Max 5 MB
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Update the contact details on your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitProfile} className="space-y-4">
                <label
                  htmlFor="profile-first-name"
                  className="block space-y-2 text-sm font-medium"
                >
                  <span>First name</span>
                  <Input
                    id="profile-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="e.g. John"
                  />
                </label>
                <label
                  htmlFor="profile-last-name"
                  className="block space-y-2 text-sm font-medium"
                >
                  <span>Last name</span>
                  <Input
                    id="profile-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="e.g. Doe"
                  />
                </label>
                <label
                  htmlFor="profile-phone"
                  className="block space-y-2 text-sm font-medium"
                >
                  <span>Phone number</span>
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    type="tel"
                    placeholder="e.g. +8801XXXXXXXXX"
                    autoComplete="tel"
                  />
                </label>
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  {saveProfile.isPending ? "Saving…" : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
              <CardDescription>
                {roleTitles[userRole]} information linked to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl>
                <ProfileValue label="Email address" value={user.email} />
                <ProfileValue label="Role" value={roleTitles[userRole]} />
                <ProfileValue
                  label="Email verification"
                  value={user.emailVerified ? "Verified" : "Not verified"}
                />
                {roleDetails(user).map(({ label, value }) => (
                  <ProfileValue key={label} label={label} value={value} />
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            {user.emailVerified ? (
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
            ) : (
              <ShieldCheck className="mt-0.5 size-5 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium">
                {user.emailVerified ? "Email verified" : "Account security"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user.emailVerified
                  ? "Your email address is verified."
                  : "Verify your email address to secure your university account."}
              </p>
            </div>
            <div className="ml-auto hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <UserRound className="size-4" />
              <span>{user.status.replaceAll("_", " ")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
