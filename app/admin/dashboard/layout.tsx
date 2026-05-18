import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) redirect("/auth/login");

  // Decode JWT token to get role
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      redirect("/auth/login");
    }

    const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const decoded: any = payload;

    const adminRoles = ["admin", "super_admin"];
    if (!adminRoles.includes(decoded.role)) {
      redirect("/");
    }

    return <>{children}</>;
  } catch (error) {
    console.error("JWT verification failed:", error);
    redirect("/auth/login");
  }
}
