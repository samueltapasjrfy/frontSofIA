"use client";
import { LoginResponse } from "@/api/authApi";
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from "@/utils/localStorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER);
    let version = userData.companies?.[0]?.id !== '01JTNVAEYETZAJP0F4X7YQYQBR' ? getLocalStorage<string>(LocalStorageKeys.VERSION) : '2';

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
