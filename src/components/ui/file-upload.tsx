import * as React from "react";
import { FileUpload as ArkFileUpload } from "@ark-ui/react/file-upload";
import { Upload, X, File as FileIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FileUploadProps
  extends Omit<ArkFileUpload.RootProps, "onFileChange" | "children" | "accept"> {
  /** Tipos de archivo aceptados (ej. "image/*", ".pdf", o una lista). */
  accept?: string | string[];
  /** Se dispara con la lista completa de archivos aceptados cada vez que cambia. */
  onFilesChange?: (files: File[]) => void;
  /** Texto del área de arrastre. */
  dropzoneLabel?: React.ReactNode;
  className?: string;
}

/**
 * Carga de archivos (drag & drop) sobre Ark UI (headless). A diferencia de
 * PrimeReact FileUpload, no incluye lógica de red — es responsabilidad de
 * quien lo use subir los archivos (ej. en `onFilesChange`) a su propio
 * backend, igual que el patrón `customUpload`/`uploadHandler` anterior.
 */
const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      accept,
      onFilesChange,
      dropzoneLabel = "Arrastra archivos aquí o haz click para elegir.",
      maxFiles = 1,
      ...props
    },
    ref,
  ) => (
    <ArkFileUpload.Root
      ref={ref}
      accept={accept}
      maxFiles={maxFiles}
      onFileChange={(details) => onFilesChange?.(details.acceptedFiles)}
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    >
      <ArkFileUpload.Dropzone
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-8 text-center",
          "transition-colors duration-150 hover:border-primary/50",
          "data-[dragging]:border-primary data-[dragging]:bg-accent/50",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{dropzoneLabel}</p>
        <ArkFileUpload.Trigger asChild>
          <button
            type="button"
            className={cn(
              "mt-1 rounded-md border border-input bg-raised px-3 py-1.5 text-sm font-medium shadow-sm",
              "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            Elegir archivos
          </button>
        </ArkFileUpload.Trigger>
      </ArkFileUpload.Dropzone>
      <ArkFileUpload.ItemGroup className="flex flex-col gap-2">
        <ArkFileUpload.Context>
          {(api) =>
            api.acceptedFiles.map((file) => (
              <ArkFileUpload.Item
                key={file.name}
                file={file}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <ArkFileUpload.ItemPreview
                  type="image/*"
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-secondary"
                >
                  <ArkFileUpload.ItemPreviewImage className="h-full w-full object-cover" />
                </ArkFileUpload.ItemPreview>
                {!file.type.startsWith("image/") ? (
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col">
                  <ArkFileUpload.ItemName className="truncate font-medium" />
                  <ArkFileUpload.ItemSizeText className="text-xs text-muted-foreground" />
                </div>
                <ArkFileUpload.ItemDeleteTrigger
                  className={cn(
                    "shrink-0 rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                >
                  <X className="h-4 w-4" />
                </ArkFileUpload.ItemDeleteTrigger>
              </ArkFileUpload.Item>
            ))
          }
        </ArkFileUpload.Context>
      </ArkFileUpload.ItemGroup>
      <ArkFileUpload.HiddenInput />
    </ArkFileUpload.Root>
  ),
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
