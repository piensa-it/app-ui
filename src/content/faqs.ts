/** Preguntas frecuentes — usadas por el centro de Ayuda. */
export const WHATSAPP_SUPPORT_URL =
  "https://wa.me/573125655293?text=Hola, necesito ayuda con MisFin";

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "¿Qué es MisFin?",
    answer:
      "MisFin es una plataforma de finanzas personales diseñada para ayudarte a gestionar tus ingresos, gastos y presupuestos de manera eficiente. Ofrecemos herramientas intuitivas para planificación financiera y educación económica.",
  },
  {
    question: "¿Cómo funciona el mes de prueba gratuito?",
    answer:
      "Al registrarte en el Plan Básico, obtienes acceso completo a todas las funciones del plan durante el primer mes sin costo. Después del período de prueba, se aplicará el cargo mensual de $10.000 COP (≈ $3 USD) si decides continuar.",
  },
  {
    question: "¿Cuál es la diferencia entre el Plan Básico y Premium?",
    answer:
      "El Plan Básico incluye registro de ingresos y gastos, categorización de transacciones, reportes mensuales básicos, seguimiento de presupuestos y calculadora de créditos. El Plan Premium agrega análisis avanzado con IA, predicciones financieras, recomendaciones personalizadas, alertas inteligentes, reportes exportables, asesoría financiera automática, integración bancaria y soporte prioritario.",
  },
  {
    question: "¿Cómo puedo cancelar mi suscripción?",
    answer:
      "Puedes cancelar tu suscripción en cualquier momento desde tu perfil de usuario o contactándonos directamente por WhatsApp. No hay penalizaciones por cancelación y seguirás teniendo acceso hasta el final del período ya pagado.",
  },
  {
    question: "¿Es segura mi información financiera?",
    answer:
      "Sí, la seguridad de tus datos es nuestra prioridad. Utilizamos encriptación de nivel bancario y almacenamiento seguro en la nube. Nunca compartimos tu información con terceros sin tu consentimiento explícito.",
  },
  {
    question: "¿Puedo usar MisFin en múltiples dispositivos?",
    answer:
      "Sí, puedes acceder a tu cuenta de MisFin desde cualquier dispositivo con conexión a internet. Tus datos se sincronizan automáticamente en todos tus dispositivos.",
  },
  {
    question: "¿Cómo funcionan los presupuestos y alertas?",
    answer:
      "Puedes establecer presupuestos mensuales por categoría. El sistema te enviará alertas cuando estés cerca de alcanzar o superar tus límites establecidos, ayudándote a mantener el control de tus gastos.",
  },
  {
    question: "¿Qué es la Cuenta Familiar?",
    answer:
      "La función de Cuenta Familiar te permite gestionar gastos compartidos con otros miembros de tu familia, facilitando el seguimiento de gastos conjuntos y la planificación financiera familiar.",
  },
  {
    question: "¿Cómo funciona el Simulador de Créditos?",
    answer:
      "El Simulador de Créditos te permite calcular cuotas mensuales para diferentes tipos de préstamos (consumo, hipotecario, libre inversión). Ten en cuenta que es una herramienta informativa y los valores pueden variar según los seguros adicionales que cada banco aplique.",
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer:
      "Sí, ofrecemos soporte a través de WhatsApp para todos nuestros usuarios. Los usuarios del Plan Premium cuentan con soporte prioritario con tiempos de respuesta más rápidos.",
  },
];
