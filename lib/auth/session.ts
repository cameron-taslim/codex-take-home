import { getServerSession as getNextAuthServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";

export async function getServerSession() {
  return getNextAuthServerSession(authOptions);
}

export async function requireUserSession() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session;
}
