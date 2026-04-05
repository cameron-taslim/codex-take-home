import React from "react";
import { redirect } from "next/navigation";
import { requireUserSession } from "@/lib/auth/session";
import { getAuthenticatedHomePath } from "@/lib/navigation";

export default async function DashboardPage() {
  const session = await requireUserSession();

  redirect(await getAuthenticatedHomePath(session.user.id));
}
