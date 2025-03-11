"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { queryClient } from "@/lib/reactQuery";

dayjs.locale('pt-br')

export default function ReactQueryProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}