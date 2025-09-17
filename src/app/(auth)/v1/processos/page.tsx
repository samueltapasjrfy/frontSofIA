"use client"
import { useRouter } from "next/navigation";

export default function Processos() {
    const navigate = useRouter();
    return navigate.push("/v1/processos/cadastros");
}