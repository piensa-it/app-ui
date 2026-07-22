import * as React from "react";
import { Calendar, type CalendarProps } from "primereact/calendar";

import { cn } from "@/lib/utils";

export type DatePickerProps = Omit<CalendarProps, "locale">;

/** Selector de fecha sobre PrimeReact Calendar, ya localizado en español. */
const DatePicker = React.forwardRef<Calendar, DatePickerProps>(
  ({ className, dateFormat = "dd/mm/yy", showIcon = true, ...props }, ref) => (
    <Calendar
      ref={ref}
      className={cn("w-full", className)}
      dateFormat={dateFormat}
      showIcon={showIcon}
      locale="es"
      {...props}
    />
  ),
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
