import { LoaderCircle } from 'lucide-react';
import Image from 'next/image';

export function LoadingPage() {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <Image src="/images/logo.png" alt="Logo" width={300} height={300} />
            <LoaderCircle className="animate-spin text-blue-600" size={40} />
        </div>
    )
}