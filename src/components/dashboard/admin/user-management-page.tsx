"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LoaderCircle,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { type FormEvent, useState } from "react";
import {
  type AdminUserStatus,
  getApiErrorMessage,
  type Resource,
  universityApi,
} from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const roles = ["ADMIN", "FACULTY", "STUDENT", "USER"] as const;
const statuses: AdminUserStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
];

function isRecord(value: unknown): value is Resource {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) return value.map(display).join(", ");
  if (isRecord(value)) {
    const name = value.name ?? value.title ?? value.code ?? value.email;
    return typeof name === "string" ? name : "Details available";
  }
  return String(value);
}

function UserEditor({
  user,
  saving,
  onClose,
  onSubmit,
}: {
  user: Resource;
  saving: boolean;
  onClose: () => void;
  onSubmit: (body: Resource) => void;
}) {
  const [firstName, setFirstName] = useState(
    display(user.firstName) === "—" ? "" : display(user.firstName),
  );
  const [lastName, setLastName] = useState(
    display(user.lastName) === "—" ? "" : display(user.lastName),
  );
  const [phone, setPhone] = useState(
    typeof user.phone === "string" ? user.phone : "",
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || null,
    });
  };

  return (
    <Modal title="Edit user" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label
          htmlFor="admin-user-first-name"
          className="space-y-2 text-sm font-medium"
        >
          First name
          <Input
            id="admin-user-first-name"
            required
            minLength={2}
            maxLength={50}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
        </label>
        <label
          htmlFor="admin-user-last-name"
          className="space-y-2 text-sm font-medium"
        >
          Last name
          <Input
            id="admin-user-last-name"
            required
            minLength={2}
            maxLength={50}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </label>
        <label
          htmlFor="admin-user-phone"
          className="space-y-2 text-sm font-medium sm:col-span-2"
        >
          Phone
          <Input
            id="admin-user-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null);
  const listQuery = {
    page,
    limit: 12,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(includeDeleted ? { includeDeleted: "true" } : {}),
  };
  const usersQuery = useQuery({
    queryKey: ["admin", "users", listQuery],
    queryFn: () => universityApi.list("user", listQuery),
  });
  const detailsQuery = useQuery({
    queryKey: ["admin", "user", selectedId],
    queryFn: () => universityApi.get("user", selectedId),
    enabled: Boolean(selectedId),
  });
  const rows = Array.isArray(usersQuery.data?.data)
    ? usersQuery.data.data.filter(isRecord)
    : [];
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Resource }) =>
      universityApi.updateAdminUser(id, body),
    onSuccess: async () => {
      await refresh();
      setEditing(null);
      toast.add({
        title: "User updated",
        description: "User information was saved.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not update user",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status: nextStatus,
    }: {
      id: string;
      status: AdminUserStatus;
    }) => universityApi.updateAdminUserStatus(id, nextStatus),
    onSuccess: async () => {
      await refresh();
      toast.add({
        title: "User status updated",
        description: "The account status has been changed.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not change user status",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });
  const deleteMutation = useMutation({
    mutationFn: universityApi.deleteAdminUser,
    onSuccess: async () => {
      await refresh();
      setDeleteTarget(null);
      toast.add({
        title: "User deleted",
        description: "The account was soft-deleted and its sessions revoked.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "Could not delete user",
        description: getApiErrorMessage(error),
        type: "error",
      }),
  });

  const fullName = (user: Resource) =>
    `${display(user.firstName)} ${display(user.lastName)}`
      .replace(/—/g, "")
      .trim() || "Unknown user";
  const userId = (user: Resource) =>
    typeof user.id === "string" ? user.id : "";

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-medium text-primary">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            User accounts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review accounts, update contact details, suspend access, or remove
            an account.
          </p>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                id="admin-users-search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, or phone"
                aria-label="Search users"
              />
            </div>
            <select
              aria-label="Filter users by role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All roles</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter users by status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-4">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(event) => {
                  setIncludeDeleted(event.target.checked);
                  setPage(1);
                }}
              />
              Include deleted accounts
            </label>
          </CardContent>
        </Card>

        {usersQuery.isPending ? (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading users…
            </CardContent>
          </Card>
        ) : usersQuery.isError ? (
          <Card>
            <CardContent className="space-y-3 p-6 text-sm text-destructive">
              Could not load users: {getApiErrorMessage(usersQuery.error)}
              <div>
                <Button
                  variant="outline"
                  onClick={() => void usersQuery.refetch()}
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
              <UserRound className="size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No matching user accounts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {rows.map((user) => {
              const id = userId(user);
              const deleted = Boolean(user.deletedAt);
              const userStatus =
                typeof user.status === "string" ? user.status : "";
              const avatar =
                typeof user.avatarUrl === "string" ? user.avatarUrl : "";
              const name = fullName(user);
              return (
                <Card key={id}>
                  <CardContent className="flex gap-4 p-5">
                    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={`${name} profile`}
                          fill
                          sizes="56px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-semibold">{name}</h2>
                          <p className="break-all text-sm text-muted-foreground">
                            {display(user.email)}
                          </p>
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                          {deleted
                            ? "DELETED"
                            : userStatus.replaceAll("_", " ")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {display(user.role)} · {display(user.phone)}
                      </p>
                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedId(id)}
                        >
                          View profile
                        </Button>
                        {!deleted && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditing(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                statusMutation.isPending ||
                                (user.role === "ADMIN" &&
                                  user.status !== "ACTIVE")
                              }
                              onClick={() =>
                                statusMutation.mutate({
                                  id,
                                  status:
                                    userStatus === "SUSPENDED"
                                      ? "ACTIVE"
                                      : "SUSPENDED",
                                })
                              }
                            >
                              {userStatus === "SUSPENDED" ? (
                                <>
                                  <ShieldCheck className="size-4" />
                                  Reactivate
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="size-4" />
                                  Suspend
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deleteMutation.isPending}
                              onClick={() => setDeleteTarget(user)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {usersQuery.data?.meta && usersQuery.data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span>
              Page {usersQuery.data.meta.page} of{" "}
              {usersQuery.data.meta.totalPages} · {usersQuery.data.meta.total}{" "}
              accounts
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= usersQuery.data.meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <UserEditor
          key={userId(editing)}
          user={editing}
          saving={updateMutation.isPending}
          onClose={() => setEditing(null)}
          onSubmit={(body) =>
            updateMutation.mutate({ id: userId(editing), body })
          }
        />
      )}
      {selectedId && (
        <Modal title="User profile" onClose={() => setSelectedId("")}>
          {detailsQuery.isPending ? (
            <div className="flex justify-center p-8">
              <LoaderCircle className="size-5 animate-spin" />
            </div>
          ) : detailsQuery.isError ? (
            <p className="text-sm text-destructive">
              {getApiErrorMessage(detailsQuery.error)}
            </p>
          ) : isRecord(detailsQuery.data?.data) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(detailsQuery.data.data)
                .filter(([key]) => key !== "passwordHash")
                .map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3">
                    <p className="text-xs capitalize text-muted-foreground">
                      {key
                        .replace(/[A-Z]/g, (letter) => ` ${letter}`)
                        .replace(/^./, (letter) => letter.toUpperCase())}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium">
                      {display(value)}
                    </p>
                  </div>
                ))}
            </div>
          ) : null}
        </Modal>
      )}
      {deleteTarget && (
        <Modal
          title="Delete user account?"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-sm text-muted-foreground">
            This soft-deletes {fullName(deleteTarget)} and revokes active
            sessions. Their university history remains preserved.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(userId(deleteTarget))}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </Modal>
      )}
    </main>
  );
}
