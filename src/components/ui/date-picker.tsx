import * as React from "react";
import { DatePicker as ArkDatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { CalendarDate, type DateValue } from "@internationalized/date";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { fieldControlVariants, floatingPanelStyles, iconButtonStyles } from "@/lib/recipes/field-control";

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
  >,
    VariantProps<typeof fieldControlVariants> {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

/** Selector de fecha sobre Ark UI (headless), localizado en español. */
const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      placeholder = "dd/mm/aaaa",
      variant,
      size,
      "aria-label": ariaLabel,
      id,
      ...props
    },
    ref,
  ) => (
    <ArkDatePicker.Root
      ref={ref}
      id={id ? `${id}-root` : undefined}
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
          fieldControlVariants({ variant, size }),
          "flex items-center gap-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
        )}
      >
        <ArkDatePicker.Input
          index={0}
          id={id}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
        <ArkDatePicker.Trigger
          aria-label="Abrir calendario"
          className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <CalendarIcon aria-hidden="true" className="size-4" />
        </ArkDatePicker.Trigger>
      </ArkDatePicker.Control>
      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content
            className={cn(
              floatingPanelStyles,
              "w-[min(22rem,calc(100vw-2rem))] p-3 sm:p-4",
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
                        iconButtonStyles,
                      )}
                    >
                      <ChevronLeft aria-hidden="true" className="size-4" />
                    </ArkDatePicker.PrevTrigger>
                    <ArkDatePicker.ViewTrigger
                      className={cn(
                        "min-h-control-default rounded-md px-3 text-sm font-semibold capitalize",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      <ArkDatePicker.RangeText />
                    </ArkDatePicker.ViewTrigger>
                    <ArkDatePicker.NextTrigger
                      className={cn(
                        iconButtonStyles,
                      )}
                    >
                      <ChevronRight aria-hidden="true" className="size-4" />
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
                                  "mx-auto flex size-10 items-center justify-center rounded-md text-sm",
                                  "transition-colors duration-normal ease-standard hover:bg-surface-hover hover:text-foreground",
                                  "data-[outside-range]:text-muted-foreground/50",
                                  "data-[today]:font-semibold data-[today]:text-primary data-[today]:ring-1 data-[today]:ring-primary/30",
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
