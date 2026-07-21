export type TransactionType = "ingreso" | "gasto" | "transferencia" | "ajuste";

export type PaymentMethod = 
  | "Efectivo"
  | "Banco"
  | "Tarjeta";

export interface Transaction {
  id: number;
  tipo: TransactionType;
  categoria: string;
  subcategoria?: string;
  valor: number;
  moneda: string;
  fecha: string;
  establecimiento?: string;
  descripcion: string;
  medio_pago: PaymentMethod;
  archivo_url?: string;
  archivo_nombre?: string;
}

export interface Subcategory {
  id: number;
  nombre: string;
}

export interface Category {
  id: number;
  nombre: string;
  color: string;
  icon: string;
  tipo: TransactionType;
  presupuesto?: number;
  subcategorias: Subcategory[];
}

export interface Config {
  moneda: "COP" | "USD" | "EUR";
  idioma: "es" | "en";
  modo_oscuro: boolean;
  meta_mensual: number;
  formato_cifras: "completo" | "miles"; // nuevo campo
}
