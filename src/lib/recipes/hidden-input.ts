import type { CSSProperties } from "react";

/**
 * Ark pinta el input nativo de Checkbox/Switch como un punto de 1 px recortado
 * (`visuallyHidden`, en línea). Un clic humano en la etiqueta ya conmutaba,
 * pero una herramienta de automatización que intenta pulsar el propio input lo
 * desplaza al centro, el contenedor vuelve, y el bucle «element is not stable»
 * agota el tiempo. Con el input cubriendo todo el control —invisible, pero del
 * tamaño de lo que se ve— el clic aterriza en él. Va en `style` porque Ark fija
 * esas propiedades en línea y una clase no las pisaría; el Root debe llevar
 * `relative`.
 */
export const hiddenInputCoverStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  margin: 0,
  clip: "auto",
};

export const hiddenInputCoverClassName = "cursor-pointer opacity-0";
