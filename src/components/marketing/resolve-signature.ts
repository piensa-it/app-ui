import type { ProductSignatureOptions } from "./product-signature";

/** Normaliza la prop `signature` de `PublicHeader`/`PublicFooter`. */
function resolveSignature(signature: boolean | ProductSignatureOptions | undefined): ProductSignatureOptions | null {
  if (!signature) return null;
  return signature === true ? {} : signature;
}

export { resolveSignature };
