import * as React from "react";
import { FileUpload as PrimeFileUpload, type FileUploadProps } from "primereact/fileupload";

import { cn } from "@/lib/utils";

export type { FileUploadProps };

/**
 * Carga de archivos (drag & drop) sobre PrimeReact FileUpload, con textos en
 * español por defecto. Para subir a un backend propio, pasa `customUpload`
 * y `uploadHandler`; en modo `auto` sube apenas se selecciona el archivo.
 */
const FileUpload = React.forwardRef<PrimeFileUpload, FileUploadProps>(
  (
    {
      className,
      mode = "advanced",
      chooseLabel = "Elegir",
      uploadLabel = "Subir",
      cancelLabel = "Cancelar",
      emptyTemplate = <p className="m-0 text-sm text-muted-foreground">Arrastra archivos aquí para subirlos.</p>,
      ...props
    },
    ref,
  ) => (
    <PrimeFileUpload
      ref={ref}
      className={cn(className)}
      mode={mode}
      chooseLabel={chooseLabel}
      uploadLabel={uploadLabel}
      cancelLabel={cancelLabel}
      emptyTemplate={emptyTemplate}
      {...props}
    />
  ),
);
FileUpload.displayName = "FileUpload";

export { FileUpload };
