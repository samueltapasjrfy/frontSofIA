"use client";
import { LoginResponse } from "@/api/authApi";
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    let version = getLocalStorage<string>(LocalStorageKeys.VERSION);
    if (!version || typeof version !== 'string') {
      version = '1';
      setLocalStorage(LocalStorageKeys.VERSION, version);
    }
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER);
    console.log({ version, user })
    if (user) {
      return redirect(`/v${version}/dashboard`);
    }
    return redirect("/login");
  }, []);
}
