// ============================================================
// DataNest - Definición de tipos TypeScript
// ============================================================

// --- Entidades de base de datos ---

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}

export interface DataSource {
  id: string;
  userId: string;
  type: "csv" | "excel" | "mercadopago" | "whatsapp";
  name: string;
  status: "active" | "error" | "syncing";
  config: Record<string, unknown>;
  lastSync: string | null;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  totalSpent?: number;
  totalPurchases?: number;
  lastPurchaseDate?: string | null;
}

export interface Sale {
  id: string;
  clientId: string | null;
  clientName?: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "cancelled" | "refunded";
  description: string | null;
  saleDate: string;
}

// --- Respuestas de la API ---

export interface DashboardData {
  kpis: {
    currentMonthSales: number;
    previousMonthSales: number;
    avgTicket: number;
    totalClients: number;
    activeClients: number;
  };
  monthlySales: Array<{
    month: string;       // "Ene 2024"
    total: number;
    transactions: number;
  }>;
  topClients: Array<{
    id: string;
    name: string;
    email: string | null;
    totalSpent: number;
    totalPurchases: number;
    lastPurchaseDate: string;
  }>;
  inactiveClients: Array<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    lastPurchaseDate: string;
    daysSince: number;
  }>;
}

// --- Chatbot ---

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// --- Mercado Pago ---

export interface MercadoPagoPayment {
  id: number;
  date_created: string;
  date_approved: string | null;
  status: string;
  transaction_amount: number;
  currency_id: string;
  description: string | null;
  payer: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    id: number | null;
  };
  metadata: Record<string, unknown>;
}

// --- Upload de archivos ---

export interface UploadResult {
  sourceId: string;
  rowsImported: number;
  errors: string[];
}

// --- Carrito de Informes PDF ---

export interface InformeItem {
  id:        string;   // ID del mensaje del asistente
  pregunta:  string;   // Texto que envió el usuario
  respuesta: string;   // Texto que respondió la IA
  fecha:     string;   // ISO string de la fecha de la respuesta
}

export interface InformeStore {
  items:          InformeItem[];
  isDrawerOpen:   boolean;
  agregarItem:    (item: InformeItem) => void;
  quitarItem:     (id: string) => void;
  vaciarInforme:  () => void;
  abrirDrawer:    () => void;
  cerrarDrawer:   () => void;
  cantidad:       number;          // computed — iguala items.length
  estaEnInforme:  (id: string) => boolean;
}

// --- Columnas esperadas en Excel/CSV de ventas ---
// El usuario debe mapear sus columnas a estos campos
export interface SaleRow {
  client_name: string;
  client_email?: string;
  amount: number | string;
  date: string;
  description?: string;
  status?: string;
}
