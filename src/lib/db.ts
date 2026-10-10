import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface Plaque {
  id: string;
  code: string;
  title: string | null;
  googleReviewUrl: string | null;
  placeName: string | null;
  status: 'VIRGIN' | 'ACTIVE' | 'PAUSED';
  feedbackGate: boolean;
  clientPhone: string | null;
  clientEmail: string | null;
  notes: string | null;
  batchTag: string | null;
  totalScans: number;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScanLog {
  id: string;
  plaqueId: string;
  userAgent: string | null;
  referrer: string | null;
  createdAt: string;
  plaqueCode?: string;
  plaqueTitle?: string;
}

export interface FeedbackLog {
  id: string;
  plaqueId: string;
  rating: number;
  comment: string | null;
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientName: string;
  saleDate: string;
  deliveryDate: string | null;
  amount: number;
  itemSold: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'CONCLUIDA' | 'CANCELADA';
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  date: string;
  dayOfWeek: string;
  totalBusinesses: number;
  ownerAbsent: number;
  declined: number;
  accepted: number;
  revenue: number;
  prospectingHours: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOffer {
  id: string;
  name: string;
  description: string | null;
  defaultPrice: number;
  active: boolean;
  createdAt: string;
}

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'plaquinhas.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS plaques (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT,
    google_review_url TEXT,
    place_name TEXT,
    status TEXT DEFAULT 'VIRGIN',
    feedback_gate INTEGER DEFAULT 0,
    client_phone TEXT,
    client_email TEXT,
    notes TEXT,
    batch_tag TEXT,
    total_scans INTEGER DEFAULT 0,
    last_scanned_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_plaques_code ON plaques(code);
  CREATE INDEX IF NOT EXISTS idx_plaques_status ON plaques(status);

  CREATE TABLE IF NOT EXISTS scan_logs (
    id TEXT PRIMARY KEY,
    plaque_id TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaque_id) REFERENCES plaques(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_scan_logs_plaque ON scan_logs(plaque_id);

  CREATE TABLE IF NOT EXISTS feedback_logs (
    id TEXT PRIMARY KEY,
    plaque_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    contact_name TEXT,
    contact_phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plaque_id) REFERENCES plaques(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    sale_date TEXT NOT NULL,
    delivery_date TEXT,
    amount REAL NOT NULL DEFAULT 0,
    item_sold TEXT NOT NULL,
    status TEXT DEFAULT 'CONCLUIDA',
    payment_method TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

  CREATE TABLE IF NOT EXISTS daily_logs (
    id TEXT PRIMARY KEY,
    date TEXT UNIQUE NOT NULL,
    day_of_week TEXT NOT NULL,
    total_businesses INTEGER DEFAULT 0,
    owner_absent INTEGER DEFAULT 0,
    declined INTEGER DEFAULT 0,
    accepted INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    prospecting_hours REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    default_price REAL DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default services if empty
const servicesCount = (db.prepare('SELECT COUNT(*) as c FROM services').get() as any).c;
if (servicesCount === 0) {
  const defaultServices = [
    { name: 'Plaquinha NFC/QR Google Reviews', price: 50.0, desc: 'Plaquinha acrílica com NFC + QR Code dinâmico para Google' },
    { name: 'Kit 2 Plaquinhas Google (Balcão + Mesa)', price: 90.0, desc: '2 Plaquinhas com QR/NFC personalizadas' },
    { name: 'Kit 3 Plaquinhas Google Reviews', price: 130.0, desc: '3 Plaquinhas com QR/NFC personalizadas' },
    { name: 'Otimização Perfil Google Meu Negócio', price: 150.0, desc: 'Configuração, fotos, categorias e SEO local no Google Maps' },
    { name: 'Gestão Mensal de Avaliações e Reputação', price: 100.0, desc: 'Acompanhamento e resposta mensal de avaliações' },
    { name: 'Outro Serviço / Produto', price: 0.0, desc: 'Serviço personalizado sob medida' }
  ];

  const insertService = db.prepare('INSERT INTO services (id, name, description, default_price, active) VALUES (?, ?, ?, ?, 1)');
  for (const s of defaultServices) {
    insertService.run(crypto.randomUUID(), s.name, s.desc, s.price);
  }
}

function mapPlaque(row: any): Plaque {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    googleReviewUrl: row.google_review_url,
    placeName: row.place_name,
    status: row.status,
    feedbackGate: Boolean(row.feedback_gate),
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    notes: row.notes,
    batchTag: row.batch_tag,
    totalScans: Number(row.total_scans || 0),
    lastScannedAt: row.last_scanned_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getPlaqueByCode(code: string): Plaque | null {
  const cleanCode = code.trim().toUpperCase();
  const row = db.prepare('SELECT * FROM plaques WHERE code = ?').get(cleanCode);
  return row ? mapPlaque(row) : null;
}

export function getPlaqueById(id: string): Plaque | null {
  const row = db.prepare('SELECT * FROM plaques WHERE id = ?').get(id);
  return row ? mapPlaque(row) : null;
}

export function getAllPlaques(status?: string, search?: string): Plaque[] {
  let query = 'SELECT * FROM plaques WHERE 1=1';
  const params: any[] = [];

  if (status && status !== 'ALL') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search && search.trim()) {
    query += ' AND (code LIKE ? OR title LIKE ? OR place_name LIKE ? OR client_phone LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  query += ' ORDER BY datetime(created_at) DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(mapPlaque);
}

export function createOrUpdatePlaque(data: {
  code: string;
  title?: string;
  googleReviewUrl?: string;
  placeName?: string;
  status?: 'VIRGIN' | 'ACTIVE' | 'PAUSED';
  feedbackGate?: boolean;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  batchTag?: string;
}): Plaque {
  const cleanCode = data.code.trim().toUpperCase();
  const existing = getPlaqueByCode(cleanCode);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE plaques SET
        title = ?,
        google_review_url = ?,
        place_name = ?,
        status = ?,
        feedback_gate = ?,
        client_phone = ?,
        client_email = ?,
        notes = ?,
        batch_tag = COALESCE(?, batch_tag),
        updated_at = ?
      WHERE code = ?
    `).run(
      data.title !== undefined ? data.title : existing.title,
      data.googleReviewUrl !== undefined ? data.googleReviewUrl : existing.googleReviewUrl,
      data.placeName !== undefined ? data.placeName : existing.placeName,
      data.status || (data.googleReviewUrl ? 'ACTIVE' : existing.status),
      data.feedbackGate !== undefined ? (data.feedbackGate ? 1 : 0) : (existing.feedbackGate ? 1 : 0),
      data.clientPhone !== undefined ? data.clientPhone : existing.clientPhone,
      data.clientEmail !== undefined ? data.clientEmail : existing.clientEmail,
      data.notes !== undefined ? data.notes : existing.notes,
      data.batchTag || null,
      now,
      cleanCode
    );
    return getPlaqueByCode(cleanCode)!;
  } else {
    const id = crypto.randomUUID();
    const status = data.status || (data.googleReviewUrl ? 'ACTIVE' : 'VIRGIN');
    db.prepare(`
      INSERT INTO plaques (
        id, code, title, google_review_url, place_name, status,
        feedback_gate, client_phone, client_email, notes, batch_tag,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanCode,
      data.title || null,
      data.googleReviewUrl || null,
      data.placeName || null,
      status,
      data.feedbackGate ? 1 : 0,
      data.clientPhone || null,
      data.clientEmail || null,
      data.notes || null,
      data.batchTag || null,
      now,
      now
    );
    return getPlaqueByCode(cleanCode)!;
  }
}

export function createBatchPlaques(count: number, prefix: string = 'PLQ', batchTag?: string): Plaque[] {
  const created: Plaque[] = [];
  const now = new Date().toISOString();

  const insertStmt = db.prepare(`
    INSERT INTO plaques (id, code, status, batch_tag, created_at, updated_at)
    VALUES (?, ?, 'VIRGIN', ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (let i = 0; i < count; i++) {
      let code = '';
      let isUnique = false;
      while (!isUnique) {
        // Gerar código de 4 a 6 dígitos alfanuméricos limpos
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = prefix ? `${prefix}-${rand}` : rand;
        const exists = db.prepare('SELECT 1 FROM plaques WHERE code = ?').get(code);
        if (!exists) isUnique = true;
      }

      const id = crypto.randomUUID();
      insertStmt.run(id, code, batchTag || `LOTE-${new Date().toISOString().slice(0, 10)}`, now, now);
      created.push(getPlaqueByCode(code)!);
    }
  });

  tx();
  return created;
}

export function deletePlaque(id: string): boolean {
  const res = db.prepare('DELETE FROM plaques WHERE id = ?').run(id);
  return res.changes > 0;
}

export function recordScan(plaqueId: string, userAgent?: string, referrer?: string) {
  const now = new Date().toISOString();
  const scanId = crypto.randomUUID();

  const updatePlaqueStmt = db.prepare(`
    UPDATE plaques
    SET total_scans = total_scans + 1, last_scanned_at = ?
    WHERE id = ?
  `);

  const insertScanStmt = db.prepare(`
    INSERT INTO scan_logs (id, plaque_id, user_agent, referrer, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    updatePlaqueStmt.run(now, plaqueId);
    insertScanStmt.run(scanId, plaqueId, userAgent || null, referrer || null, now);
  });

  tx();
}

export function recordFeedback(plaqueId: string, rating: number, comment?: string, contactName?: string, contactPhone?: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO feedback_logs (id, plaque_id, rating, comment, contact_name, contact_phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, plaqueId, rating, comment || null, contactName || null, contactPhone || null, now);
}

export function getDashboardStats() {
  const totalPlaques = (db.prepare('SELECT COUNT(*) as c FROM plaques').get() as any).c;
  const activePlaques = (db.prepare("SELECT COUNT(*) as c FROM plaques WHERE status = 'ACTIVE'").get() as any).c;
  const virginPlaques = (db.prepare("SELECT COUNT(*) as c FROM plaques WHERE status = 'VIRGIN'").get() as any).c;
  const totalScans = (db.prepare('SELECT SUM(total_scans) as s FROM plaques').get() as any).s || 0;
  
  const scansToday = (db.prepare(`
    SELECT COUNT(*) as c FROM scan_logs 
    WHERE date(created_at) = date('now')
  `).get() as any).c;

  const recentScans = db.prepare(`
    SELECT s.*, p.code as plaqueCode, p.title as plaqueTitle
    FROM scan_logs s
    JOIN plaques p ON s.plaque_id = p.id
    ORDER BY s.created_at DESC
    LIMIT 8
  `).all();

  const recentFeedbacks = db.prepare(`
    SELECT f.*, p.code as plaqueCode, p.title as plaqueTitle
    FROM feedback_logs f
    JOIN plaques p ON f.plaque_id = p.id
    ORDER BY f.created_at DESC
    LIMIT 8
  `).all();

  return {
    totalPlaques,
    activePlaques,
    virginPlaques,
    totalScans,
    scansToday,
    recentScans,
    recentFeedbacks
  };
}

// ==========================================
// GESTÃO SOLUS: SALES / VENDAS
// ==========================================

function mapSale(row: any): Sale {
  return {
    id: row.id,
    clientName: row.client_name,
    saleDate: row.sale_date,
    deliveryDate: row.delivery_date,
    amount: Number(row.amount || 0),
    itemSold: row.item_sold,
    status: row.status || 'CONCLUIDA',
    paymentMethod: row.payment_method,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getAllSales(startDate?: string, endDate?: string, search?: string): Sale[] {
  let query = 'SELECT * FROM sales WHERE 1=1';
  const params: any[] = [];

  if (startDate) {
    query += ' AND date(sale_date) >= date(?)';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date(sale_date) <= date(?)';
    params.push(endDate);
  }

  if (search && search.trim()) {
    query += ' AND (client_name LIKE ? OR item_sold LIKE ? OR notes LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  query += ' ORDER BY date(sale_date) DESC, datetime(created_at) DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(mapSale);
}

export function getSaleById(id: string): Sale | null {
  const row = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
  return row ? mapSale(row) : null;
}

// Sync daily log metrics (revenue and accepted sales) automatically when sales change
export function syncDailyLogForDate(dateStr: string) {
  try {
    const salesRow = db.prepare(`
      SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as totalRevenue
      FROM sales
      WHERE date(sale_date) = date(?)
    `).get(dateStr) as any;

    const salesCount = Number(salesRow?.count || 0);
    const totalRevenue = Number(salesRow?.totalRevenue || 0);

    const existing = getDailyLogByDate(dateStr);
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dayName = dayNames[dateObj.getDay()] || 'Dia';

    const now = new Date().toISOString();

    if (existing) {
      const updatedAccepted = Math.max(existing.accepted, salesCount);
      const updatedBusinesses = Math.max(
        existing.totalBusinesses,
        updatedAccepted + existing.declined + existing.ownerAbsent
      );

      db.prepare(`
        UPDATE daily_logs SET
          revenue = ?,
          accepted = ?,
          total_businesses = ?,
          updated_at = ?
        WHERE date = ?
      `).run(totalRevenue, updatedAccepted, updatedBusinesses, now, dateStr);
    } else if (salesCount > 0 || totalRevenue > 0) {
      const id = crypto.randomUUID();
      db.prepare(`
        INSERT INTO daily_logs (
          id, date, day_of_week, total_businesses, owner_absent,
          declined, accepted, revenue, prospecting_hours, notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0, 0, ?, ?, 0, null, ?, ?)
      `).run(id, dateStr, dayName, salesCount, salesCount, totalRevenue, now, now);
    }
  } catch (err) {
    console.error('Erro ao sincronizar daily_log para a data:', dateStr, err);
  }
}

export function createSale(data: {
  clientName: string;
  saleDate: string;
  deliveryDate?: string | null;
  amount: number;
  itemSold: string;
  status?: 'PENDENTE' | 'ENTREGUE' | 'CONCLUIDA' | 'CANCELADA';
  paymentMethod?: string | null;
  notes?: string | null;
}): Sale {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO sales (
      id, client_name, sale_date, delivery_date, amount, item_sold,
      status, payment_method, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.clientName.trim(),
    data.saleDate,
    data.deliveryDate || null,
    data.amount,
    data.itemSold.trim(),
    data.status || 'CONCLUIDA',
    data.paymentMethod || null,
    data.notes || null,
    now,
    now
  );

  // Automatically synchronize daily log
  syncDailyLogForDate(data.saleDate);

  return getSaleById(id)!;
}

export function updateSale(id: string, data: {
  clientName?: string;
  saleDate?: string;
  deliveryDate?: string | null;
  amount?: number;
  itemSold?: string;
  status?: 'PENDENTE' | 'ENTREGUE' | 'CONCLUIDA' | 'CANCELADA';
  paymentMethod?: string | null;
  notes?: string | null;
}): Sale | null {
  const existing = getSaleById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const oldDate = existing.saleDate;

  db.prepare(`
    UPDATE sales SET
      client_name = ?,
      sale_date = ?,
      delivery_date = ?,
      amount = ?,
      item_sold = ?,
      status = ?,
      payment_method = ?,
      notes = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    data.clientName !== undefined ? data.clientName.trim() : existing.clientName,
    data.saleDate !== undefined ? data.saleDate : existing.saleDate,
    data.deliveryDate !== undefined ? data.deliveryDate : existing.deliveryDate,
    data.amount !== undefined ? data.amount : existing.amount,
    data.itemSold !== undefined ? data.itemSold.trim() : existing.itemSold,
    data.status !== undefined ? data.status : existing.status,
    data.paymentMethod !== undefined ? data.paymentMethod : existing.paymentMethod,
    data.notes !== undefined ? data.notes : existing.notes,
    now,
    id
  );

  // Synchronize both old and new dates if changed
  syncDailyLogForDate(data.saleDate || oldDate);
  if (data.saleDate && data.saleDate !== oldDate) {
    syncDailyLogForDate(oldDate);
  }

  return getSaleById(id);
}

export function deleteSale(id: string): boolean {
  const existing = getSaleById(id);
  const res = db.prepare('DELETE FROM sales WHERE id = ?').run(id);
  if (existing) {
    syncDailyLogForDate(existing.saleDate);
  }
  return res.changes > 0;
}

// ==========================================
// GESTÃO SOLUS: DAILY LOGS / PROSPECÇÃO DIÁRIA
// ==========================================

function mapDailyLog(row: any): DailyLog {
  return {
    id: row.id,
    date: row.date,
    dayOfWeek: row.day_of_week,
    totalBusinesses: Number(row.total_businesses || 0),
    ownerAbsent: Number(row.owner_absent || 0),
    declined: Number(row.declined || 0),
    accepted: Number(row.accepted || 0),
    revenue: Number(row.revenue || 0),
    prospectingHours: Number(row.prospecting_hours || 0),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getDailyLogsByRange(startDate: string, endDate: string): DailyLog[] {
  const rows = db.prepare(`
    SELECT * FROM daily_logs 
    WHERE date(date) >= date(?) AND date(date) <= date(?)
    ORDER BY date(date) ASC
  `).all(startDate, endDate);

  return rows.map(mapDailyLog);
}

export function getDailyLogByDate(dateStr: string): DailyLog | null {
  const row = db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(dateStr);
  return row ? mapDailyLog(row) : null;
}

export function saveDailyLog(data: {
  date: string;
  dayOfWeek: string;
  totalBusinesses: number;
  ownerAbsent: number;
  declined: number;
  accepted: number;
  revenue: number;
  prospectingHours: number;
  notes?: string | null;
}): DailyLog {
  const existing = getDailyLogByDate(data.date);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE daily_logs SET
        day_of_week = ?,
        total_businesses = ?,
        owner_absent = ?,
        declined = ?,
        accepted = ?,
        revenue = ?,
        prospecting_hours = ?,
        notes = ?,
        updated_at = ?
      WHERE date = ?
    `).run(
      data.dayOfWeek,
      data.totalBusinesses,
      data.ownerAbsent,
      data.declined,
      data.accepted,
      data.revenue,
      data.prospectingHours,
      data.notes !== undefined ? data.notes : existing.notes,
      now,
      data.date
    );
    return getDailyLogByDate(data.date)!;
  } else {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO daily_logs (
        id, date, day_of_week, total_businesses, owner_absent,
        declined, accepted, revenue, prospecting_hours, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.date,
      data.dayOfWeek,
      data.totalBusinesses,
      data.ownerAbsent,
      data.declined,
      data.accepted,
      data.revenue,
      data.prospectingHours,
      data.notes || null,
      now,
      now
    );
    return getDailyLogByDate(data.date)!;
  }
}

// ==========================================
// GESTÃO SOLUS: SERVICES / PRODUTOS
// ==========================================

export function getAllServices(): ServiceOffer[] {
  const rows = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY name ASC').all();
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    defaultPrice: Number(r.default_price || 0),
    active: Boolean(r.active),
    createdAt: r.created_at
  }));
}

export function createService(name: string, description?: string, defaultPrice: number = 0): ServiceOffer {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO services (id, name, description, default_price, active, created_at)
    VALUES (?, ?, ?, ?, 1, ?)
  `).run(id, name.trim(), description || null, defaultPrice, now);

  const row = db.prepare('SELECT * FROM services WHERE id = ?').get(id) as any;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    defaultPrice: Number(row.default_price),
    active: Boolean(row.active),
    createdAt: row.created_at
  };
}

export function deleteService(id: string): boolean {
  const res = db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(id);
  return res.changes > 0;
}

// ==========================================
// GESTÃO SOLUS: WEEKLY BALANCE / BALANÇO DA SEMANA
// ==========================================

export function getWeeklySummary(startDate: string, endDate: string) {
  // Aggregate daily logs for the week
  const logs = getDailyLogsByRange(startDate, endDate);

  // Aggregate sales for the week
  const sales = getAllSales(startDate, endDate);

  let totalBusinesses = 0;
  let totalOwnerAbsent = 0;
  let totalDeclined = 0;
  let totalAccepted = 0;
  let totalLogRevenue = 0;
  let totalProspectingHours = 0;

  for (const log of logs) {
    totalBusinesses += log.totalBusinesses;
    totalOwnerAbsent += log.ownerAbsent;
    totalDeclined += log.declined;
    totalAccepted += log.accepted;
    totalLogRevenue += log.revenue;
    totalProspectingHours += log.prospectingHours;
  }

  // Total sales revenue from sales table (or log revenue if preferred)
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalSalesCount = sales.length;

  // Use sales table revenue if sales exist, else daily log revenue
  const totalRevenue = totalSalesRevenue > 0 ? totalSalesRevenue : totalLogRevenue;

  // Key performance indicators
  const decisionsCount = totalAccepted + totalDeclined;
  const conversionRate = decisionsCount > 0 ? (totalAccepted / decisionsCount) * 100 : 0;
  const visitSuccessRate = totalBusinesses > 0 ? (totalAccepted / totalBusinesses) * 100 : 0;
  const revenuePerHour = totalProspectingHours > 0 ? totalRevenue / totalProspectingHours : 0;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : (totalAccepted > 0 ? totalRevenue / totalAccepted : 0);

  return {
    period: { startDate, endDate },
    totals: {
      totalBusinesses,
      totalOwnerAbsent,
      totalDeclined,
      totalAccepted,
      totalProspectingHours,
      totalRevenue,
      totalSalesCount,
      conversionRate: Number(conversionRate.toFixed(1)),
      visitSuccessRate: Number(visitSuccessRate.toFixed(1)),
      revenuePerHour: Number(revenuePerHour.toFixed(2)),
      averageTicket: Number(averageTicket.toFixed(2))
    },
    dailyLogs: logs,
    sales: sales
  };
}

