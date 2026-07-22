import * as React from "react";
import { DatePicker as ArkDatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { CalendarDate, type DateValue } from "@internationalized/date";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";

function toCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function toNativeDate(value: DateValue): Date {
  return new Date(value.year, value.month - 1, value.day);
}

export interface DatePickerProps
  extends Omit<
    ArkDatePicker.RootProps,
    "value" | "onValueChange" | "children" | "locale" | "selectionMode" | "onChange"
  > {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

/** Selector de fecha sobre Ark UI (headless), localizado en español. */
const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ className, value, onChange, placeholder = "dd/mm/aaaa", ...props }, ref) => (
    <ArkDatePicker.Root
      ref={ref}
      locale="es"
      selectionMode="single"
      value={value ? [toCalendarDate(value)] : []}
      onValueChange={(details) => {
        const next = details.value[0];
        onChange?.(next ? toNativeDate(next) : null);
      }}
      className={cn("w-full", className)}
      {...props}
    >
      <ArkDatePicker.Control
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
          "transition-colors duration-150 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        <ArkDatePicker.Input
          index={0}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <ArkDatePicker.Trigger className="shrink-0 text-muted-foreground hover:text-foreground">
          <CalendarIcon className="h-4 w-4" />
        </ArkDatePicker.Trigger>
      </ArkDatePicker.Control>
      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content
            className={cn(
              "z-50 w-72 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg outline-none",
              elevationRing,
              popoverAnimation,
            )}
          >
            <ArkDatePicker.Context>
              {(api) => (
                <ArkDatePicker.View view="day">
                  <ArkDatePicker.ViewControl className="mb-2 flex items-center justify-between">
                    <ArkDatePicker.PrevTrigger
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </ArkDatePicker.PrevTrigger>
                    <ArkDatePicker.ViewTrigger
                      className={cn(
                        "rounded-md px-2 py-1 text-sm font-medium capitalize",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <ArkDatePicker.RangeText />
                    </ArkDatePicker.ViewTrigger>
                    <ArkDatePicker.NextTrigger
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </ArkDatePicker.NextTrigger>
                  </ArkDatePicker.ViewControl>
                  <ArkDatePicker.Table className="w-full border-collapse">
                    <ArkDatePicker.TableHead>
                      <ArkDatePicker.TableRow>
                        {api.weekDays.map((day, index) => (
                          <ArkDatePicker.TableHeader
                            key={index}
                            className="pb-1 text-xs font-medium text-muted-foreground"
                          >
                            {day.narrow}
                          </ArkDatePicker.TableHeader>
                        ))}
                      </ArkDatePicker.TableRow>
                    </ArkDatePicker.TableHead>
                    <ArkDatePicker.TableBody>
                      {api.weeks.map((week, weekIndex) => (
                        <ArkDatePicker.TableRow key={weekIndex}>
                          {week.map((day, dayIndex) => (
                            <ArkDatePicker.TableCell key={dayIndex} value={day} className="p-0 text-center">
                              <ArkDatePicker.TableCellTrigger
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-md text-sm",
                                  "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
                                  "data-[outside-range]:text-muted-foreground/50",
                                  "data-[today]:font-semibold data-[today]:text-primary",
                                  "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary/90",
                                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                )}
                              >
                                {day.day}
                              </ArkDatePicker.TableCellTrigger>
                            </ArkDatePicker.TableCell>
                          ))}
                        </ArkDatePicker.TableRow>
                      ))}
                    </ArkDatePicker.TableBody>
                  </ArkDatePicker.Table>
                </ArkDatePicker.View>
              )}
            </ArkDatePicker.Context>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  ),
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
