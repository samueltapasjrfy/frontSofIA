"use client";

import { ProcessApi } from "@/api/processApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessInfoModalInfos } from "./ProcessInfoModalInfos";
import { ProcessInfoModalAudiences } from "./ProcessInfoModalAudiences";
import { ProcessInfoModalParties } from "./ProcessInfoModalParties";

interface ProcessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  processInfoSelected: ProcessApi.FindAll.Process | null;
}

export function ProcessInfoModal({ isOpen, onClose, processInfoSelected }: ProcessInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Processo - {processInfoSelected?.cnj}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="audiences">Audiências</TabsTrigger>
            <TabsTrigger value="parties">Partes</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <ProcessInfoModalInfos processInfoSelected={processInfoSelected} />
          </TabsContent>
          <TabsContent value="audiences">
            <ProcessInfoModalAudiences audiences={processInfoSelected?.audiences || []} />
          </TabsContent>
          <TabsContent value="parties">
            <ProcessInfoModalParties parties={processInfoSelected?.parties || []} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 