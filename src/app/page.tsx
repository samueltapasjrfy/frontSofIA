"use client";
import { LoginResponse } from "@/api/authApi";
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER);
    let version = ['01KFXZPRSBQGBA5QKB94NVNYB1','01JTNVAEYETZAJP0F4X7YQYQBR'].includes(userData?.companies?.[0]?.id) ? '2' : getLocalStorage(LocalStorageKeys.VERSION);

    if (!version || typeof version !== 'string') {
      version = '1';
      setLocalStorage(LocalStorageKeys.VERSION, version);
    }
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER);
    if (typeof user === 'object' && user?.user?.id) {
      return redirect(`/v${version}/publicacoes`);
    }
    return redirect("/login");
  }, []);
}
