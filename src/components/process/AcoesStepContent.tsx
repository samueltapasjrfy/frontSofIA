"use client";

import { AlertTriangle, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

export type AcoesActions = { consult: boolean; monitoring: boolean };

export type AcoesSearch = {
  data: boolean;
  citations: boolean;
  audiences: boolean;
  habilitations: boolean;
};

export type AcoesValue = { actions: AcoesActions; search: AcoesSearch };

export const defaultAcoesValue: AcoesValue = {
  actions: { consult: false, monitoring: false },
  search: { data: false, citations: false, audiences: false, habilitations: false },
};

type ModeId = "consult" | "consultMonitor" | "monitor";

const MODE_OPTIONS: {
  id: ModeId;
  title: string;
  description: string;
  tooltipTitle: string;
  tooltipDescription: string;
  warning?: boolean;
  actions: AcoesActions;
}[] = [
  {
    id: "consult",
    title: "Consulta Única",
    description: "Busca pontual nos tribunais. Sem acompanhamento.",
    tooltipTitle: "Consulta Única",
    tooltipDescription:
      "Realiza uma única busca nos tribunais, sem monitoramento contínuo depois.",
    actions: { consult: true, monitoring: false },
  },
  {
    id: "consultMonitor",
    title: "Consulta + Monitorar",
    description: "Busca inicial e monitoramento contínuo.",
    tooltipTitle: "Consulta + Monitorar",
    tooltipDescription:
      "Faz a busca inicial e, em seguida, passa a monitorar continuamente novos indicativos.",
    actions: { consult: true, monitoring: true },
  },
  {
    id: "monitor",
    title: "Só Monitorar",
    description: "Apenas monitora indicativos sem consulta inicial.",
    tooltipTitle: "Apenas indicativos futuros",
    tooltipDescription:
      'Esse modo detecta apenas novos indicativos a partir de agora. Para capturar indicativos anteriores, use "Consulta + Monitorar".',
    warning: true,
    actions: { consult: false, monitoring: true },
  },
];

const SEARCH_OPTIONS: {
  key: keyof AcoesSearch;
  title: string;
  description: string;
  accent: string;
  accentSelected: string;
}[] = [
  {
    key: "data",
    title: "Dados de Capa",
    description: "Informações gerais do processo",
    accent: "border-blue-200 hover:border-blue-300",
    accentSelected: "border-blue-500 bg-blue-50",
  },
  {
    key: "citations",
    title: "Citação",
    description: "Indicativo de citação da parte para defesa",
    accent: "border-amber-200 hover:border-amber-300",
    accentSelected: "border-amber-500 bg-amber-50",
  },
  {
    key: "audiences",
    title: "Audiência",
    description: "Audiências futuras agendadas",
    accent: "border-red-200 hover:border-red-300",
    accentSelected: "border-red-500 bg-red-50",
  },
  {
    key: "habilitations",
    title: "Habilitação",
    description: "Habilitação de advogado no processo",
    accent: "border-purple-200 hover:border-purple-300",
    accentSelected: "border-purple-500 bg-purple-50",
  },
];

function getSelectedMode(actions: AcoesActions): ModeId | null {
  if (actions.consult && !actions.monitoring) return "consult";
  if (actions.consult && actions.monitoring) return "consultMonitor";
  if (!actions.consult && actions.monitoring) return "monitor";
  return null;
}

function isConsultMode(actions: AcoesActions): boolean {
  return actions.consult === true;
}

export function canContinueAcoes(value: AcoesValue): boolean {
  const hasMode = value.actions.consult || value.actions.monitoring;
  const hasSearch = Object.values(value.search).some(Boolean);
  return hasMode && hasSearch;
}

interface AcoesFieldsProps {
  value: AcoesValue;
  onChange: (value: AcoesValue) => void;
  className?: string;
}

export function AcoesFields({ value, onChange, className }: AcoesFieldsProps) {
  const selectedMode = getSelectedMode(value.actions);
  const consultMode = isConsultMode(value.actions);

  const selectMode = (actions: AcoesActions) => {
    const nextSearch: AcoesSearch = { ...value.search };
    if (actions.consult) {
      nextSearch.data = true;
    }
    onChange({ actions, search: nextSearch });
  };

  const toggleSearch = (key: keyof AcoesSearch, checked: boolean) => {
    if (key === "data" && consultMode) return;
    onChange({ ...value, search: { ...value.search, [key]: checked } });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className={cn("space-y-6", className)}>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Modo de Operação
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODE_OPTIONS.map((option) => {
              const isSelected = selectedMode === option.id;
              return (
                <Tooltip key={option.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectMode(option.actions)}
                      className={cn(
                        "group relative flex flex-col items-start gap-1 rounded-lg border bg-white p-3 text-left transition-all",
                        "hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500"
                          : "border-gray-200",
                      )}
                    >
                      <div className="flex w-full items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            isSelected
                              ? "border-blue-600 bg-white"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                          )}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {option.title}
                        </span>
                        {option.warning && (
                          <AlertTriangle className="ml-auto h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="max-w-xs bg-gray-900 text-white"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold">{option.tooltipTitle}</p>
                      <p className="text-[11px] leading-snug opacity-90">
                        {option.tooltipDescription}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            O que deseja buscar?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SEARCH_OPTIONS.map((option) => {
              const isChecked = value.search[option.key];
              const isLocked = option.key === "data" && consultMode;
              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border bg-white p-3 transition-colors",
                    isChecked ? option.accentSelected : option.accent,
                    isLocked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    disabled={isLocked}
                    onCheckedChange={(v) =>
                      toggleSearch(option.key, v === true)
                    }
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      {option.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {option.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface AcoesStepContentProps {
  value: AcoesValue;
  onChange: (value: AcoesValue) => void;
  onContinue: () => void;
  onCancel?: () => void;
  continueLabel?: string;
}

export function AcoesStepContent({
  value,
  onChange,
  onContinue,
  onCancel,
  continueLabel = "Continuar",
}: AcoesStepContentProps) {
  const selectedMode = getSelectedMode(value.actions);
  const selectedModeLabel =
    MODE_OPTIONS.find((m) => m.id === selectedMode)?.title ?? "Nenhum modo";
  const selectedSearchCount = Object.values(value.search).filter(Boolean).length;
  const canContinue = canContinueAcoes(value);

  return (
    <div className="space-y-6 px-1">
      <AcoesFields value={value} onChange={onChange} />
      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="text-xs text-gray-500">
          {selectedMode ? (
            <div className="flex items-center gap-1">
              <span className="font-medium text-blue-500 flex items-center gap-1">
                <InfoIcon className="h-4 w-4 mr-1 shrink-0" /> {selectedModeLabel}
              </span>
              <span className="mx-1">·</span>
              <span>
                {selectedSearchCount}{" "}
                {selectedSearchCount === 1 ? "indicativo selecionado" : "indicativos selecionados"}
              </span>
            </div>
          ) : (
            <span>Selecione um modo de operação</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={onContinue} disabled={!canContinue}>
            {continueLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
