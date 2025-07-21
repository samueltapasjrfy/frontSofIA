"use client"

import * as React from "react"
import dayjs from "dayjs"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover"
import { ptBR } from "date-fns/locale"

type DatePickerWithRangeProps = {
    date: DateRange | undefined;
    onChange: (date: DateRange | undefined) => void;
}
export function DatePickerWithRange({
    className,
    date,
    onChange,
}: React.HTMLAttributes<HTMLDivElement> & DatePickerWithRangeProps) {
    const locale = {
        ...ptBR,
        formatters: {
            formatDay: (date: Date) => dayjs(date).format("DD/MM/YYYY"),
        },
    };
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {dayjs(date.from).format("MMM DD, YYYY")} -{" "}
                                    {dayjs(date.to).format("MMM DD, YYYY")}
                                </>
                            ) : (
                                dayjs(date.from).format("MMM DD, YYYY")
                            )
                        ) : (
                            <span>Selecione o período</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        locale={locale}
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(range) => onChange(range)}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
