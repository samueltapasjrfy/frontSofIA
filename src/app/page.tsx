"use client";
import { LoginResponse } from "@/api/authApi";
import { getLocalStorage, LocalStorageKeys } from "@/utils/localStorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const version = getLocalStorage<string>(LocalStorageKeys.VERSION);
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER);
    if (user) {
      return redirect(`/v${version}/dashboard`);
    }
    return redirect("/login");
  }, []);
}
