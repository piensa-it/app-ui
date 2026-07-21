/**
 * Traducción ligera y acotada a la Landing pública (ES/EN/FR).
 *
 * No es un framework de i18n para toda la app (eso es una decisión más
 * grande, ver docs/backlog.md P4-22) — es un diccionario propio, simple,
 * pensado solo para las páginas de marketing (Landing, y el modal de
 * autenticación que vive en ella) donde llega tráfico real de EE.UU. y
 * Francia según GA4.
 */

export type Lang = "es" | "en" | "fr";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

const STORAGE_KEY = "misfin_lang";

export function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "es";
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("lang");
  if (fromQuery === "es" || fromQuery === "en" || fromQuery === "fr") {
    localStorage.setItem(STORAGE_KEY, fromQuery);
    return fromQuery;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en" || stored === "fr") return stored;
  return "es";
}

export function persistLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
}

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Testimonial {
  text: string;
  author: string;
  role: string;
}

interface Feature {
  title: string;
  description: string;
}

export interface LandingCopy {
  nav: {
    personasBadge: string;
    empresas: string;
    login: string;
    signupCta: string;
  };
  hero: {
    badge: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  phoneMockup: {
    balance: string;
    budget: string;
    income: string;
    expense: string;
    grocery: string;
    transport: string;
    salary: string;
  };
  stats: {
    activeUsers: string;
    trackedExpenses: string;
    avgRating: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: Testimonial[];
  };
  features: {
    title: string;
    subtitle: string;
    items: Feature[];
  };
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    annual: string;
    annualDiscount: string;
    annualNudge: string;
    free: {
      badge: string;
      priceSuffix: string;
      description: string;
      features: PlanFeature[];
      cta: string;
    };
    premium: {
      badge: string;
      popularBadge: string;
      priceSuffix: string;
      billedAnnually: (total: string) => string;
      description: string;
      features: PlanFeature[];
      ctaMonthly: string;
      ctaAnnual: (total: string) => string;
      noCard: string;
    };
    reassurance: string;
  };
  cta: {
    titleBefore: string;
    titleHighlight: string;
    subtitleBefore: string;
    subtitleBold: string;
    benefits: string[];
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    tagline: string;
    developedBy: string;
    terms: string;
    privacy: string;
    cookies: string;
  };
  auth: {
    welcomeBack: string;
    createAccount: string;
    tabLogin: string;
    tabSignup: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    confirmPasswordLabel: string;
    countryLabel: string;
    cityLabel: string;
    birthDateLabel: string;
    phoneLabel: string;
    currencyLabel: string;
    login: string;
    loggingIn: string;
    forgotPassword: string;
    backToLogin: string;
    sendResetLink: string;
    sending: string;
    dataProcessingPrefix: string;
    dataProcessingLink: string;
    termsPrefix: string;
    termsLink: string;
    createAccountBtn: string;
    creatingAccount: string;
  };
  toasts: {
    invalidEmail: string;
    passwordMinLength: string;
    passwordRequiresLetterNumber: string;
    passwordsDontMatch: string;
    mustBe18: string;
    nameRequired: string;
    countryRequired: string;
    cityRequired: string;
    phoneRequired: string;
    mustAcceptTerms: string;
    loginError: string;
    loginSuccess: string;
    validEmailRequired: string;
    resetLinkSent: string;
    resetLinkError: string;
    userAlreadyRegistered: string;
    signupError: string;
    signupSuccess: string;
  };
}

const es: LandingCopy = {
  nav: { personasBadge: "Personas", empresas: "Empresas", login: "Iniciar sesión", signupCta: "Comenzar gratis" },
  hero: {
    badge: "Empieza gratis · Actualiza cuando quieras · Desde $2/mes",
    titleBefore: "Organiza tu dinero, ",
    titleHighlight: "simplifica",
    titleAfter: " tu vida",
    subtitle:
      "Registra tus gastos, visualiza tus finanzas y alcanza tus metas. Comienza gratis y desbloquea todo por menos de un café al mes.",
    ctaPrimary: "Comenzar gratis",
    ctaSecondary: "Iniciar sesión →",
  },
  phoneMockup: {
    balance: "Balance total",
    budget: "Presupuesto mensual",
    income: "Ingresos",
    expense: "Gastos",
    grocery: "Mercado",
    transport: "Transporte",
    salary: "Salario",
  },
  stats: {
    activeUsers: "Usuarios activos",
    trackedExpenses: "Registrados en gastos",
    avgRating: "Valoración promedio",
  },
  testimonials: {
    title: "Lo que dicen nuestros usuarios",
    subtitle: "Miles de personas ya organizan sus finanzas con MisFin",
    items: [
      { text: "¡Por fin entiendo a dónde va mi dinero!", author: "María G.", role: "Diseñadora freelance" },
      { text: "Simple, útil y sin complicaciones. Justo lo que necesitaba.", author: "Carlos M.", role: "Estudiante universitario" },
      { text: "Me ayudó a ahorrar más de lo que imaginé.", author: "Laura P.", role: "Emprendedora" },
      { text: "La mejor app para organizar mis finanzas personales.", author: "Andrés R.", role: "Ingeniero de software" },
      { text: "Interfaz limpia y fácil de usar. Muy recomendada.", author: "Sofía L.", role: "Contadora" },
    ],
  },
  features: {
    title: "Todo lo que necesitas",
    subtitle: "Herramientas simples y poderosas para que tomes el control de tu dinero",
    items: [
      { title: "Registra tus gastos", description: "Lleva el control de cada peso que gastas de forma simple y rápida." },
      { title: "Visualiza tu dinero", description: "Gráficos claros que te muestran exactamente cómo gastas." },
      { title: "Alcanza tus metas", description: "Define objetivos de ahorro y sigue tu progreso fácilmente." },
    ],
  },
  pricing: {
    title: "Planes simples y transparentes",
    subtitle: "Comienza gratis. Sin sorpresas. Actualiza solo cuando lo necesites.",
    monthly: "Mensual",
    annual: "Anual",
    annualDiscount: "−15%",
    annualNudge: "Ahorra pagando anual",
    free: {
      badge: "PLAN GRATUITO",
      priceSuffix: "/siempre",
      description: "Para empezar a tomar el control de tus finanzas.",
      features: [
        { text: "Hasta 50 transacciones al mes", included: true },
        { text: "1 cuenta de dinero", included: true },
        { text: "Categorías básicas (5)", included: true },
        { text: "Reportes simples", included: true },
        { text: "Acceso de por vida al plan gratuito", included: true },
        { text: "Transacciones ilimitadas", included: false },
        { text: "Múltiples cuentas", included: false },
        { text: "Categorías personalizadas ilimitadas", included: false },
        { text: "Reportes avanzados y gráficos", included: false },
        { text: "Presupuestos y metas de ahorro", included: false },
      ],
      cta: "Comenzar gratis",
    },
    premium: {
      badge: "PREMIUM",
      popularBadge: "MÁS POPULAR",
      priceSuffix: "/mes",
      billedAnnually: (total) => `Facturado anualmente — $${total} USD/año`,
      description: "Menos que un café. Control total de tus finanzas.",
      features: [
        { text: "Transacciones ilimitadas", included: true },
        { text: "Múltiples cuentas de dinero", included: true },
        { text: "Categorías personalizadas ilimitadas", included: true },
        { text: "Reportes avanzados y gráficos", included: true },
        { text: "Presupuestos y metas de ahorro", included: true },
        { text: "Recordatorios de pagos", included: true },
        { text: "Exportar datos (CSV)", included: true },
        { text: "Soporte prioritario", included: true },
        { text: "Nuevas funciones primero", included: true },
        { text: "Cuenta familiar (próximamente)", included: true },
      ],
      ctaMonthly: "Comenzar — $2/mes",
      ctaAnnual: (total) => `Comenzar — $${total}/año`,
      noCard: "Sin tarjeta de crédito · Cancela cuando quieras",
    },
    reassurance: "🔒 Tus datos siempre son tuyos. Exporta todo en cualquier momento.",
  },
  cta: {
    titleBefore: "Empieza gratis hoy, ",
    titleHighlight: "crece a tu ritmo",
    subtitleBefore: "Sin tarjeta de crédito. Sin compromisos. Cuando estés listo para más, actualiza por solo ",
    subtitleBold: "$2 USD al mes",
    benefits: ["Plan gratuito para siempre", "Premium desde $2/mes", "Cancela cuando quieras"],
    ctaPrimary: "Crear cuenta — es gratis",
    ctaSecondary: "Ya tengo cuenta →",
  },
  footer: {
    tagline: "Gestión financiera inteligente para personas.",
    developedBy: "Desarrollado con ❤️ por",
    terms: "Términos",
    privacy: "Privacidad",
    cookies: "Cookies",
  },
  auth: {
    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crea tu cuenta",
    tabLogin: "Iniciar sesión",
    tabSignup: "Registrarse",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    nameLabel: "Nombre completo",
    confirmPasswordLabel: "Confirmar contraseña",
    countryLabel: "País",
    cityLabel: "Ciudad",
    birthDateLabel: "Fecha de nacimiento",
    phoneLabel: "Celular",
    currencyLabel: "Moneda",
    login: "Iniciar sesión",
    loggingIn: "Iniciando sesión...",
    forgotPassword: "¿Olvidaste tu contraseña?",
    backToLogin: "Volver al inicio de sesión",
    sendResetLink: "Enviar enlace de recuperación",
    sending: "Enviando...",
    dataProcessingPrefix: "Acepto el",
    dataProcessingLink: "tratamiento de datos personales",
    termsPrefix: "Acepto los",
    termsLink: "términos y condiciones",
    createAccountBtn: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
  },
  toasts: {
    invalidEmail: "Email inválido",
    passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
    passwordRequiresLetterNumber: "Debe contener letras y números",
    passwordsDontMatch: "Las contraseñas no coinciden",
    mustBe18: "Debes tener al menos 18 años para registrarte",
    nameRequired: "El nombre es requerido",
    countryRequired: "El país es requerido",
    cityRequired: "La ciudad es requerida",
    phoneRequired: "El celular debe tener al menos 10 dígitos",
    mustAcceptTerms: "Debes aceptar los términos y el tratamiento de datos para continuar",
    loginError: "Error al iniciar sesión",
    loginSuccess: "Inicio de sesión exitoso",
    validEmailRequired: "Por favor ingresa un correo válido",
    resetLinkSent: "Si el correo está registrado, recibirás un enlace de recuperación",
    resetLinkError: "Error al enviar correo de recuperación",
    userAlreadyRegistered: "Este correo ya está registrado. Por favor, inicia sesión.",
    signupError: "Error al crear la cuenta",
    signupSuccess: "¡Cuenta creada exitosamente!",
  },
};

const en: LandingCopy = {
  nav: { personasBadge: "Personal", empresas: "Business", login: "Log in", signupCta: "Start for free" },
  hero: {
    badge: "Start free · Upgrade anytime · From $2/mo",
    titleBefore: "Organize your money, ",
    titleHighlight: "simplify",
    titleAfter: " your life",
    subtitle:
      "Track your expenses, visualize your finances and reach your goals. Start for free and unlock everything for less than a coffee a month.",
    ctaPrimary: "Start for free",
    ctaSecondary: "Log in →",
  },
  phoneMockup: {
    balance: "Total balance",
    budget: "Monthly budget",
    income: "Income",
    expense: "Expenses",
    grocery: "Groceries",
    transport: "Transport",
    salary: "Salary",
  },
  stats: {
    activeUsers: "Active users",
    trackedExpenses: "Tracked in expenses",
    avgRating: "Average rating",
  },
  testimonials: {
    title: "What our users say",
    subtitle: "Thousands of people already organize their finances with MisFin",
    items: [
      { text: "I finally understand where my money goes!", author: "María G.", role: "Freelance designer" },
      { text: "Simple, useful and hassle-free. Exactly what I needed.", author: "Carlos M.", role: "College student" },
      { text: "It helped me save more than I imagined.", author: "Laura P.", role: "Entrepreneur" },
      { text: "The best app for organizing my personal finances.", author: "Andrés R.", role: "Software engineer" },
      { text: "Clean interface, easy to use. Highly recommended.", author: "Sofía L.", role: "Accountant" },
    ],
  },
  features: {
    title: "Everything you need",
    subtitle: "Simple, powerful tools to take control of your money",
    items: [
      { title: "Track your expenses", description: "Keep track of every dollar you spend, simply and fast." },
      { title: "Visualize your money", description: "Clear charts that show you exactly how you spend." },
      { title: "Reach your goals", description: "Set savings goals and follow your progress easily." },
    ],
  },
  pricing: {
    title: "Simple, transparent plans",
    subtitle: "Start free. No surprises. Upgrade only when you need to.",
    monthly: "Monthly",
    annual: "Annual",
    annualDiscount: "−15%",
    annualNudge: "Save by paying annually",
    free: {
      badge: "FREE PLAN",
      priceSuffix: "/forever",
      description: "To start taking control of your finances.",
      features: [
        { text: "Up to 50 transactions per month", included: true },
        { text: "1 money account", included: true },
        { text: "Basic categories (5)", included: true },
        { text: "Simple reports", included: true },
        { text: "Lifetime access to the free plan", included: true },
        { text: "Unlimited transactions", included: false },
        { text: "Multiple accounts", included: false },
        { text: "Unlimited custom categories", included: false },
        { text: "Advanced reports and charts", included: false },
        { text: "Budgets and savings goals", included: false },
      ],
      cta: "Start for free",
    },
    premium: {
      badge: "PREMIUM",
      popularBadge: "MOST POPULAR",
      priceSuffix: "/mo",
      billedAnnually: (total) => `Billed annually — $${total} USD/year`,
      description: "Less than a coffee. Total control of your finances.",
      features: [
        { text: "Unlimited transactions", included: true },
        { text: "Multiple money accounts", included: true },
        { text: "Unlimited custom categories", included: true },
        { text: "Advanced reports and charts", included: true },
        { text: "Budgets and savings goals", included: true },
        { text: "Payment reminders", included: true },
        { text: "Export data (CSV)", included: true },
        { text: "Priority support", included: true },
        { text: "New features first", included: true },
        { text: "Family account (coming soon)", included: true },
      ],
      ctaMonthly: "Start — $2/mo",
      ctaAnnual: (total) => `Start — $${total}/year`,
      noCard: "No credit card required · Cancel anytime",
    },
    reassurance: "🔒 Your data is always yours. Export everything anytime.",
  },
  cta: {
    titleBefore: "Start free today, ",
    titleHighlight: "grow at your own pace",
    subtitleBefore: "No credit card. No commitments. When you're ready for more, upgrade for just ",
    subtitleBold: "$2 USD a month",
    benefits: ["Free plan forever", "Premium from $2/mo", "Cancel anytime"],
    ctaPrimary: "Create account — it's free",
    ctaSecondary: "I already have an account →",
  },
  footer: {
    tagline: "Smart financial management for individuals.",
    developedBy: "Built with ❤️ by",
    terms: "Terms",
    privacy: "Privacy",
    cookies: "Cookies",
  },
  auth: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    tabLogin: "Log in",
    tabSignup: "Sign up",
    emailLabel: "Email",
    passwordLabel: "Password",
    nameLabel: "Full name",
    confirmPasswordLabel: "Confirm password",
    countryLabel: "Country",
    cityLabel: "City",
    birthDateLabel: "Date of birth",
    phoneLabel: "Phone",
    currencyLabel: "Currency",
    login: "Log in",
    loggingIn: "Logging in...",
    forgotPassword: "Forgot your password?",
    backToLogin: "Back to login",
    sendResetLink: "Send recovery link",
    sending: "Sending...",
    dataProcessingPrefix: "I accept the",
    dataProcessingLink: "personal data processing policy",
    termsPrefix: "I accept the",
    termsLink: "terms and conditions",
    createAccountBtn: "Create account",
    creatingAccount: "Creating account...",
  },
  toasts: {
    invalidEmail: "Invalid email",
    passwordMinLength: "Password must be at least 8 characters",
    passwordRequiresLetterNumber: "Must contain letters and numbers",
    passwordsDontMatch: "Passwords don't match",
    mustBe18: "You must be at least 18 years old to sign up",
    nameRequired: "Name is required",
    countryRequired: "Country is required",
    cityRequired: "City is required",
    phoneRequired: "Phone must have at least 10 digits",
    mustAcceptTerms: "You must accept the terms and data processing policy to continue",
    loginError: "Error logging in",
    loginSuccess: "Logged in successfully",
    validEmailRequired: "Please enter a valid email",
    resetLinkSent: "If the email is registered, you'll receive a recovery link",
    resetLinkError: "Error sending recovery email",
    userAlreadyRegistered: "This email is already registered. Please log in.",
    signupError: "Error creating account",
    signupSuccess: "Account created successfully!",
  },
};

const fr: LandingCopy = {
  nav: { personasBadge: "Particuliers", empresas: "Entreprises", login: "Se connecter", signupCta: "Commencer gratuitement" },
  hero: {
    badge: "Commencez gratuitement · Évoluez quand vous voulez · Dès 2 $/mois",
    titleBefore: "Organisez votre argent, ",
    titleHighlight: "simplifiez",
    titleAfter: " votre vie",
    subtitle:
      "Suivez vos dépenses, visualisez vos finances et atteignez vos objectifs. Commencez gratuitement et débloquez tout pour moins d'un café par mois.",
    ctaPrimary: "Commencer gratuitement",
    ctaSecondary: "Se connecter →",
  },
  phoneMockup: {
    balance: "Solde total",
    budget: "Budget mensuel",
    income: "Revenus",
    expense: "Dépenses",
    grocery: "Courses",
    transport: "Transport",
    salary: "Salaire",
  },
  stats: {
    activeUsers: "Utilisateurs actifs",
    trackedExpenses: "Dépenses enregistrées",
    avgRating: "Note moyenne",
  },
  testimonials: {
    title: "Ce que disent nos utilisateurs",
    subtitle: "Des milliers de personnes organisent déjà leurs finances avec MisFin",
    items: [
      { text: "Je comprends enfin où va mon argent !", author: "María G.", role: "Designer indépendante" },
      { text: "Simple, utile et sans complications. Exactement ce dont j'avais besoin.", author: "Carlos M.", role: "Étudiant universitaire" },
      { text: "Ça m'a aidé à épargner plus que je ne l'imaginais.", author: "Laura P.", role: "Entrepreneuse" },
      { text: "La meilleure application pour organiser mes finances personnelles.", author: "Andrés R.", role: "Ingénieur logiciel" },
      { text: "Interface claire et facile à utiliser. Très recommandée.", author: "Sofía L.", role: "Comptable" },
    ],
  },
  features: {
    title: "Tout ce dont vous avez besoin",
    subtitle: "Des outils simples et puissants pour reprendre le contrôle de votre argent",
    items: [
      { title: "Enregistrez vos dépenses", description: "Suivez chaque euro dépensé, simplement et rapidement." },
      { title: "Visualisez votre argent", description: "Des graphiques clairs qui montrent exactement comment vous dépensez." },
      { title: "Atteignez vos objectifs", description: "Définissez des objectifs d'épargne et suivez votre progression facilement." },
    ],
  },
  pricing: {
    title: "Des plans simples et transparents",
    subtitle: "Commencez gratuitement. Sans surprises. Évoluez seulement quand vous en avez besoin.",
    monthly: "Mensuel",
    annual: "Annuel",
    annualDiscount: "−15%",
    annualNudge: "Économisez en payant annuellement",
    free: {
      badge: "PLAN GRATUIT",
      priceSuffix: "/toujours",
      description: "Pour commencer à prendre le contrôle de vos finances.",
      features: [
        { text: "Jusqu'à 50 transactions par mois", included: true },
        { text: "1 compte", included: true },
        { text: "Catégories de base (5)", included: true },
        { text: "Rapports simples", included: true },
        { text: "Accès à vie au plan gratuit", included: true },
        { text: "Transactions illimitées", included: false },
        { text: "Comptes multiples", included: false },
        { text: "Catégories personnalisées illimitées", included: false },
        { text: "Rapports et graphiques avancés", included: false },
        { text: "Budgets et objectifs d'épargne", included: false },
      ],
      cta: "Commencer gratuitement",
    },
    premium: {
      badge: "PREMIUM",
      popularBadge: "LE PLUS POPULAIRE",
      priceSuffix: "/mois",
      billedAnnually: (total) => `Facturé annuellement — ${total} $ US/an`,
      description: "Moins cher qu'un café. Contrôle total de vos finances.",
      features: [
        { text: "Transactions illimitées", included: true },
        { text: "Comptes multiples", included: true },
        { text: "Catégories personnalisées illimitées", included: true },
        { text: "Rapports et graphiques avancés", included: true },
        { text: "Budgets et objectifs d'épargne", included: true },
        { text: "Rappels de paiement", included: true },
        { text: "Exporter les données (CSV)", included: true },
        { text: "Support prioritaire", included: true },
        { text: "Nouvelles fonctionnalités en avant-première", included: true },
        { text: "Compte familial (bientôt disponible)", included: true },
      ],
      ctaMonthly: "Commencer — 2 $/mois",
      ctaAnnual: (total) => `Commencer — ${total} $/an`,
      noCard: "Sans carte de crédit · Annulez quand vous voulez",
    },
    reassurance: "🔒 Vos données vous appartiennent toujours. Exportez tout à tout moment.",
  },
  cta: {
    titleBefore: "Commencez gratuitement aujourd'hui, ",
    titleHighlight: "évoluez à votre rythme",
    subtitleBefore: "Sans carte de crédit. Sans engagement. Quand vous serez prêt pour plus, évoluez pour seulement ",
    subtitleBold: "2 $ US par mois",
    benefits: ["Plan gratuit pour toujours", "Premium dès 2 $/mois", "Annulez quand vous voulez"],
    ctaPrimary: "Créer un compte — c'est gratuit",
    ctaSecondary: "J'ai déjà un compte →",
  },
  footer: {
    tagline: "Gestion financière intelligente pour les particuliers.",
    developedBy: "Développé avec ❤️ par",
    terms: "Conditions",
    privacy: "Confidentialité",
    cookies: "Cookies",
  },
  auth: {
    welcomeBack: "Bon retour",
    createAccount: "Créez votre compte",
    tabLogin: "Se connecter",
    tabSignup: "S'inscrire",
    emailLabel: "E-mail",
    passwordLabel: "Mot de passe",
    nameLabel: "Nom complet",
    confirmPasswordLabel: "Confirmer le mot de passe",
    countryLabel: "Pays",
    cityLabel: "Ville",
    birthDateLabel: "Date de naissance",
    phoneLabel: "Téléphone",
    currencyLabel: "Devise",
    login: "Se connecter",
    loggingIn: "Connexion en cours...",
    forgotPassword: "Mot de passe oublié ?",
    backToLogin: "Retour à la connexion",
    sendResetLink: "Envoyer le lien de récupération",
    sending: "Envoi en cours...",
    dataProcessingPrefix: "J'accepte la",
    dataProcessingLink: "politique de traitement des données personnelles",
    termsPrefix: "J'accepte les",
    termsLink: "conditions générales",
    createAccountBtn: "Créer un compte",
    creatingAccount: "Création du compte...",
  },
  toasts: {
    invalidEmail: "E-mail invalide",
    passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
    passwordRequiresLetterNumber: "Doit contenir des lettres et des chiffres",
    passwordsDontMatch: "Les mots de passe ne correspondent pas",
    mustBe18: "Vous devez avoir au moins 18 ans pour vous inscrire",
    nameRequired: "Le nom est requis",
    countryRequired: "Le pays est requis",
    cityRequired: "La ville est requise",
    phoneRequired: "Le téléphone doit contenir au moins 10 chiffres",
    mustAcceptTerms: "Vous devez accepter les conditions et le traitement des données pour continuer",
    loginError: "Erreur de connexion",
    loginSuccess: "Connexion réussie",
    validEmailRequired: "Veuillez saisir un e-mail valide",
    resetLinkSent: "Si l'e-mail est enregistré, vous recevrez un lien de récupération",
    resetLinkError: "Erreur lors de l'envoi de l'e-mail de récupération",
    userAlreadyRegistered: "Cet e-mail est déjà enregistré. Veuillez vous connecter.",
    signupError: "Erreur lors de la création du compte",
    signupSuccess: "Compte créé avec succès !",
  },
};

export const LANDING_I18N: Record<Lang, LandingCopy> = { es, en, fr };
