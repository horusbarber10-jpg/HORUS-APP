import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";

const SUPABASE_URL = "https://bbkwbmxaqserojttseaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cy-Qi1Jd-EPbC6bRkEPYxg_f0PdFGMy";
const ADMIN_PIN = "1234";
const WHATSAPP_NUMBER = "34603768132";
const INSTAGRAM = "horuss_barber_";

const db = {
  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  },
  async get(table, query = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    return res.ok ? await res.json() : [];
  },
};

const SERVICIOS = [
  { id: 1, nombre: "Corte", precio: 13, duracion: "30 min", emoji: "✂️", color: "#c9a84c" },
  { id: 2, nombre: "Corte + Cejas", precio: 15, duracion: "40 min", emoji: "✨", color: "#e07b54" },
  { id: 3, nombre: "Corte + Barba", precio: 17, duracion: "50 min", emoji: "🧔", color: "#7b9e87" },
  { id: 4, nombre: "Corte Premium", precio: 20, duracion: "60 min", emoji: "👑", color: "#5b8dd9" },
];

const BONOS = [
  { id: 1, nombre: "Bono 5 Cortes", precio: 55, ahorro: 10, emoji: "🎟️", color: "#c9a84c", desc: "5 cortes al precio de 4.5" },
  { id: 2, nombre: "Bono 5 Corte+Cejas", precio: 65, ahorro: 10, emoji: "🎟️", color: "#e07b54", desc: "5 corte+cejas al precio de 4.5" },
  { id: 3, nombre: "Bono 5 Corte+Barba", precio: 75, ahorro: 10, emoji: "🎟️", color: "#7b9e87", desc: "5 corte+barba al precio de 4.5" },
  { id: 4, nombre: "Bono 5 Corte Premium", precio: 90, ahorro: 10, emoji: "🎟️", color: "#5b8dd9", desc: "5 cortes premium al precio de 4.5" },
];

const HORARIOS_BASE = [
  "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00",
  "16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00",
];

const GALERIA = [
  { id: 1, img: "https://www.instagram.com/p/DB6ujqpOa6L/media/?size=l", titulo: "Fade Clásico", url: "https://www.instagram.com/p/DB6ujqpOa6L/" },
  { id: 2, img: "https://www.instagram.com/p/DIyBliNtp1R/media/?size=l", titulo: "Corte Moderno", url: "https://www.instagram.com/p/DIyBliNtp1R/" },
  { id: 3, img: "https://www.instagram.com/p/DB6vd4rugN5/media/?size=l", titulo: "Fade con Rulos", url: "https://www.instagram.com/p/DB6vd4rugN5/" },
  { id: 4, img: "https://www.instagram.com/p/DB6vEKDOUMU/media/?size=l", titulo: "Skin Fade", url: "https://www.instagram.com/p/DB6vEKDOUMU/" },
  { id: 5, img: "https://www.instagram.com/p/DCtrEIwtHP5/media/?size=l", titulo: "Degradado Largo", url: "https://www.instagram.com/p/DCtrEIwtHP5/" },
  { id: 6, img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop", titulo: "Estilo Clásico", url: `https://instagram.com/${INSTAGRAM}` },
];

const INFO = {
  nombre: "Horus Barber",
  barberia: "Barbería de Horus",
  direccion: "Calle Constitución 4, Alcobendas",
  horario: "Lun - Sáb · 10:00 - 21:30",
  descanso: "Descanso 14:30 - 16:30",
  maps: "https://maps.google.com/?q=Calle+Constitucion+4+Alcobendas+Madrid",
};

const HORUS_EMAIL = "horusbarber10@gmail.com";

const CHAT_SYSTEM = `Eres el asistente IA de Horus Barber, una barbería premium en Alcobendas.
Dirección: Calle Constitución 4, Alcobendas. Horario: Lunes a Sábado de 10:00 a 21:30 con descanso de 14:30 a 16:30.
Servicios: Corte 13€ (30min), Corte+Cejas 15€ (40min), Corte+Barba 17€ (50min), Corte Premium 20€ (60min).
Bonos: Bono 5 Cortes 55€ (ahorras 10€), Bono 5 Corte+Barba 75€ (ahorras 10€).
Instagram: @horuss_barber_ WhatsApp: +34 603 768 132.
Programa fidelidad: cada 6 cortes el 7º gratis.
Política cancelación: señal de 5€ al reservar. Si cancelas con menos de 24h pierdes la señal.
Responde en español, amigable y profesional. Ayuda con reservas, precios, horarios, consejos de estilo y cuidado del cabello.`;

// ── COMPONENTES AUXILIARES ──

function HorusLogo({ size = 48, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="50" cy="50" r="46" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      <path d="M10 50 C25 22, 75 22, 90 50 C75 78, 25 78, 10 50 Z" stroke="#c9a84c" strokeWidth="2" fill="rgba(201,168,76,0.05)" />
      <circle cx="50" cy="50" r="16" stroke="#c9a84c" strokeWidth="2.5" fill="rgba(201,168,76,0.1)" />
      <circle cx="50" cy="50" r="7" fill="#c9a84c" />
      <circle cx="53" cy="47" r="2.5" fill="rgba(255,255,255,0.6)" />
      <path d="M34 50 L26 58 L30 58 L32 54" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M66 50 L74 58 L70 58 L68 54" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 38 L28 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 30 L50 24" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 38 L72 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AuthInput({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: "rgba(240,236,228,0.4)", marginBottom: 5 }}>{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "11px 14px",
          color: "#f0ece4",
          fontSize: 13,
          outline: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
      />
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: "rgba(220,53,69,0.08)",
      border: "1px solid rgba(220,53,69,0.2)",
      borderRadius: 8,
      padding: "9px 12px",
      fontSize: 12,
      color: "#ff6b7a",
      marginBottom: 12,
    }}>
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 15,
      height: 15,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function Fonts() {
  return (
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap"
      rel="stylesheet"
    />
  );
}

function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 0; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
      @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
      @keyframes spin { to { transform: rotate(360deg) } }
      .fade-in { animation: fadeIn 0.3s ease forwards; }
      .btn-gold {
        background: linear-gradient(135deg, #c9a84c, #e8c97a);
        color: #0a0a0a;
        font-weight: 600;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        transition: transform 0.15s, opacity 0.15s;
      }
      .btn-gold:hover { transform: scale(1.02); opacity: 0.95; }
      .glass {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        backdrop-filter: blur(10px);
        margin-bottom: 8px;
      }
      .hover-scale { transition: transform 0.15s; cursor: pointer; }
      .hover-scale:hover { transform: scale(1.01); }
    `}</style>
  );
}

// ── COMPONENTE PRINCIPAL ──

export default function HorusApp() {
  const [authStep, setAuthStep] = useState("splash");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", code: "", birthday: "" });
  const [formError, setFormError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState("");
  const [bookings, setBookings] = useState([]);
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [tiempoEspera, setTiempoEspera] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [nuevaResena, setNuevaResena] = useState({ estrellas: 5, texto: "" });
  const [notifications, setNotifications] = useState([
    { id: 1, title: "¡Bienvenido a Horus Barber! 🎉", body: "Reserva tu primera cita ahora.", time: "ahora", read: false },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [promos, setPromos] = useState([
    { id: 1, titulo: "🔥 Corte Premium", desc: "Precio especial 20€ → 17€", activa: true, codigo: "PREMIUM17" },
  ]);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "¡Hola! 👋 Soy el asistente de Horus Barber. ¿En qué puedo ayudarte?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminForm, setAdminForm] = useState({ nombre: "", servicio: "Corte", fecha: "", hora: "10:00", precio: 13 });
  const [fotoEstilo, setFotoEstilo] = useState(null);
  const [recomendacion, setRecomendacion] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [ultimaCita, setUltimaCita] = useState(null);

  const chatEndRef = useRef(null);
  const notifRef = useRef(null);
  const fileRef = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selectedFecha) {
      db.get("reservas", `fecha=eq.${selectedFecha}`).then((data) =>
        setHorariosOcupados(data.map((r) => r.hora))
      );
    }
  }, [selectedFecha]);

  const addNotification = (title, body) =>
    setNotifications((prev) => [{ id: Date.now(), title, body, time: "ahora", read: false }, ...prev]);

  const enviarConfirmacion = (nombre, email, servicio, fecha, hora) => {
    const templateParams = {
      cliente_nombre: nombre,
      cliente_email: email,
      servicio,
      fecha,
      hora,
      barberia_email: HORUS_EMAIL,
    };
    // Email al CLIENTE
    emailjs
      .send("service_hw0edjg", "template_2lbjcad", templateParams, "z4v2fPBwRV8J35TAg")
      .then(() => console.log("✅ Email enviado al cliente:", email))
      .catch((error) => console.error("❌ Error email cliente:", error));

    // Email al BARBERO
    emailjs
      .send("service_hw0edjg", "template_7po1pzn", { ...templateParams, to_email: HORUS_EMAIL }, "z4v2fPBwRV8J35TAg")
      .then(() => console.log("✅ Email enviado al barbero"))
      .catch((error) => console.error("❌ Error email barbero:", error));
  };

  const enviarWhatsApp = (servicio, hora, fecha, nombre) => {
    const msg = `¡Hola Horus! Quiero reservar 📅%0A%0A👤 *${nombre}*%0A✂️ *${servicio}*%0A🕐 *${hora}*%0A📆 *${fecha}*`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const enviarRecordatorio = (b) => {
    const msg = `⏰ *Recordatorio de cita - Horus Barber*%0A%0AHola! Te recordamos tu cita mañana:%0A✂️ ${b.servicio}%0A🕐 ${b.hora}%0A📆 ${b.fecha}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const reservaExpres = () => {
    if (!ultimaCita) { alert("Aún no tienes citas anteriores."); return; }
    setSelectedServicio(SERVICIOS.find((s) => s.nombre === ultimaCita.servicio));
    setSelectedHorario(ultimaCita.hora);
    setScreen("reservar");
    addNotification("⚡ Reserva exprés", `Mismo servicio: ${ultimaCita.servicio} a las ${ultimaCita.hora}`);
  };

  const analizarEstilo = async (base64) => {
    setAnalizando(true);
    setRecomendacion("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
                { type: "text", text: "Analiza la forma de la cara de esta persona y recomienda 2-3 estilos de corte de pelo que le favorezcan. Sé específico y amigable. Máximo 150 palabras." },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      setRecomendacion(data.content?.[0]?.text || "No pude analizar la foto.");
    } catch {
      setRecomendacion("Error al analizar. Inténtalo de nuevo.");
    }
    setAnalizando(false);
  };

  const handleLogin = async () => {
    setFormError("");
    if (!form.email || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Contraseña muy corta."); return; }
    setAuthLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setUser({ name: form.email.split("@")[0], email: form.email, visitas: 0 });
    setAuthLoading(false);
    setAuthStep("app");
  };

  const handleRegister = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Mínimo 6 caracteres."); return; }
    setAuthLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAuthLoading(false);
    setAuthStep("verify");
  };

  const handleVerify = async () => {
    setFormError("");
    if (form.code.length !== 6) { setFormError("El código tiene 6 dígitos."); return; }
    setAuthLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUser({ name: form.name, email: form.email, phone: form.phone, visitas: 0, birthday: form.birthday });
    setAuthLoading(false);
    setAuthStep("app");
    addNotification("✅ ¡Bienvenido!", `Hola ${form.name}, tu cuenta está lista. ¡A por el primer corte!`);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: CHAT_SYSTEM,
          messages: [
            ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg },
          ],
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.content?.[0]?.text || "No entendí eso. ¿Puedes repetirlo?" }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Inténtalo de nuevo." }]);
    }
    setIsTyping(false);
  };

  const base = {
    fontFamily: "'DM Sans', sans-serif",
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#f0ece4",
    display: "flex",
    flexDirection: "column",
    maxWidth: 430,
    margin: "0 auto",
    position: "relative",
    overflow: "hidden",
  };

  const totalIngresos = bookings.reduce((a, b) => a + b.precio, 0);
  const servicioMasPedido = bookings.length
    ? bookings.reduce((acc, b) => { acc[b.servicio] = (acc[b.servicio] || 0) + 1; return acc; }, {})
    : {};
  const topServicio = Object.entries(servicioMasPedido).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // ── SPLASH ──
  if (authStep === "splash") return (
    <div style={{ ...base, justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Fonts /><GlobalStyles />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(201,168,76,0.05) 0%, transparent 60%)" }} />
      <div style={{ textAlign: "center", zIndex: 1, padding: 32, width: "100%" }}>
        <HorusLogo size={96} style={{ margin: "0 auto 18px" }} />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 48, fontWeight: 900, letterSpacing: "-1px", marginBottom: 4 }}>HORUS</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: "rgba(240,236,228,0.45)", marginBottom: 4 }}>BARBER</div>
        <div style={{ fontSize: 10, letterSpacing: "3px", color: "rgba(240,236,228,0.25)", marginBottom: 32 }}>ALCOBENDAS · PREMIUM</div>
        {promos.filter((p) => p.activa).map((p) => (
          <div key={p.id} style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "9px 14px", marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: "#c9a84c", fontWeight: 600 }}>{p.titulo}</span> — {p.desc}
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, fontSize: 11, color: "rgba(240,236,228,0.45)" }}>
          📍 {INFO.direccion}<br />🕐 {INFO.horario}
        </div>
        <button className="btn-gold" onClick={() => setAuthStep("register")} style={{ width: "100%", padding: "14px", fontSize: 14, borderRadius: 14, marginBottom: 10 }}>
          Crear cuenta
        </button>
        <button onClick={() => setAuthStep("login")} style={{ width: "100%", padding: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#f0ece4", fontSize: 13, cursor: "pointer", marginBottom: 16 }}>
          Ya tengo cuenta
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")} style={{ flex: 1, padding: "11px", background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 12, color: "#25d366", fontSize: 12, cursor: "pointer" }}>
            💬 WhatsApp
          </button>
          <button onClick={() => window.open(`https://instagram.com/${INSTAGRAM}`, "_blank")} style={{ flex: 1, padding: "11px", background: "rgba(193,53,132,0.1)", border: "1px solid rgba(193,53,132,0.2)", borderRadius: 12, color: "#c13584", fontSize: 12, cursor: "pointer" }}>
            📸 Instagram
          </button>
        </div>
        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, fontSize: 10, color: "rgba(240,236,228,0.3)", textAlign: "left" }}>
          📱 <strong style={{ color: "#c9a84c" }}>Instalar app:</strong> Chrome → menú ⋮ → "Instalar app" o "Añadir a pantalla inicio"
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──
  if (authStep === "login") return (
    <div style={{ ...base, justifyContent: "center", padding: "40px 28px" }}>
      <Fonts /><GlobalStyles />
      <div style={{ zIndex: 1 }}>
        <button onClick={() => setAuthStep("splash")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>← Volver</button>
        <HorusLogo size={40} style={{ marginBottom: 12 }} />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Iniciar sesión</div>
        <div style={{ color: "rgba(240,236,228,0.4)", fontSize: 13, marginBottom: 28 }}>Bienvenido de nuevo</div>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <AuthInput label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        {formError && <ErrorBox msg={formError} />}
        <button className="btn-gold" onClick={handleLogin} disabled={authLoading} style={{ width: "100%", padding: "14px", fontSize: 14, borderRadius: 14, marginBottom: 14 }}>
          {authLoading ? <Spinner /> : "Entrar"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "rgba(240,236,228,0.4)" }}>¿No tienes cuenta? <span style={{ color: "#c9a84c", cursor: "pointer" }} onClick={() => setAuthStep("register")}>Regístrate</span></div>
      </div>
    </div>
  );

  // ── REGISTER ──
  if (authStep === "register") return (
    <div style={{ ...base, padding: "40px 28px", overflowY: "auto" }}>
      <Fonts /><GlobalStyles />
      <div style={{ zIndex: 1 }}>
        <button onClick={() => setAuthStep("splash")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>← Volver</button>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Crear cuenta</div>
        <div style={{ color: "rgba(240,236,228,0.4)", fontSize: 13, marginBottom: 24 }}>Únete a Horus Barber</div>
        <AuthInput label="Nombre completo" placeholder="Tu nombre" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
        <AuthInput label="Teléfono" type="tel" placeholder="+34 600 000 000" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
        <AuthInput label="Fecha de nacimiento" type="date" placeholder="" value={form.birthday} onChange={(v) => setForm((f) => ({ ...f, birthday: v }))} />
        <AuthInput label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} />
        <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: "rgba(240,236,228,0.6)", lineHeight: 1.7 }}>
          🏆 Programa fidelidad: cada <strong style={{ color: "#c9a84c" }}>6 cortes el 7º gratis</strong><br />
          🎂 Descuento especial en tu cumpleaños
        </div>
        {formError && <ErrorBox msg={formError} />}
        <button className="btn-gold" onClick={handleRegister} disabled={authLoading} style={{ width: "100%", padding: "14px", fontSize: 14, borderRadius: 14, marginBottom: 14 }}>
          {authLoading ? <Spinner /> : "Crear cuenta"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "rgba(240,236,228,0.4)" }}>¿Ya tienes cuenta? <span style={{ color: "#c9a84c", cursor: "pointer" }} onClick={() => setAuthStep("login")}>Inicia sesión</span></div>
      </div>
    </div>
  );

  // ── VERIFY ──
  if (authStep === "verify") return (
    <div style={{ ...base, justifyContent: "center", padding: "40px 28px" }}>
      <Fonts /><GlobalStyles />
      <div style={{ zIndex: 1 }}>
        <button onClick={() => setAuthStep("register")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>← Volver</button>
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 12 }}>📱</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 8 }}>Verificar email</div>
        <div style={{ color: "rgba(240,236,228,0.4)", fontSize: 13, textAlign: "center", marginBottom: 24 }}>Introduce el código de 6 dígitos enviado a {form.email}</div>
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "14px", color: "#f0ece4", fontSize: 24, textAlign: "center", letterSpacing: 8, outline: "none", marginBottom: 14 }}
        />
        <div style={{ background: "rgba(91,141,217,0.1)", border: "1px solid rgba(91,141,217,0.2)", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "rgba(240,236,228,0.5)", marginBottom: 16 }}>
          💡 Para esta demo, introduce cualquier código de 6 dígitos
        </div>
        {formError && <ErrorBox msg={formError} />}
        <button className="btn-gold" onClick={handleVerify} disabled={authLoading} style={{ width: "100%", padding: "14px", fontSize: 14, borderRadius: 14 }}>
          {authLoading ? <Spinner /> : "Verificar"}
        </button>
      </div>
    </div>
  );

  // ── APP PRINCIPAL ──
  return (
    <div style={base}>
      <Fonts /><GlobalStyles />

      {/* HEADER */}
      <div style={{ padding: "12px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HorusLogo size={30} />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>HORUS</div>
            <div style={{ fontSize: 7, color: "rgba(240,236,228,0.25)", letterSpacing: "1.5px" }}>BARBER · ALCOBENDAS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); setNotifications((p) => p.map((n) => ({ ...n, read: true }))); }}
              style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f0ece4", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              🔔
              {unread > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#c9a84c", color: "#0a0a0a", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{ position: "absolute", right: 0, top: 42, width: 270, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, zIndex: 100, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: 11, fontWeight: 600, color: "rgba(240,236,228,0.5)" }}>Notificaciones</div>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(240,236,228,0.45)", lineHeight: 1.4 }}>{n.body}</div>
                    <div style={{ fontSize: 9, color: "rgba(240,236,228,0.25)", marginTop: 2 }}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div onClick={() => setScreen("perfil")} style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#c9a84c,#e8c97a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#0a0a0a", cursor: "pointer" }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {/* NAV TABS */}
      <div style={{ display: "flex", padding: "6px 10px", gap: 3, background: "rgba(10,10,10,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[["home","🏠","Inicio"],["reservar","📅","Reservar"],["galeria","📸","Galería"],["estilo","🪄","Estilo"],["chat","💬","Chat"],["miscitas","📋","Mis Citas"]].map(([tab, emoji, label]) => (
          <button key={tab} onClick={() => setScreen(tab)} style={{ flex: 1, padding: "6px 2px", background: screen === tab ? "rgba(201,168,76,0.12)" : "none", border: screen === tab ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent", borderRadius: 8, color: screen === tab ? "#c9a84c" : "rgba(240,236,228,0.4)", fontSize: 9, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 14 }}>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 80px" }}>

        {/* ── HOME ── */}
        {screen === "home" && (
          <div className="fade-in">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Hola, {user?.name} 👋</div>
              <div style={{ color: "rgba(240,236,228,0.35)", fontSize: 11 }}>Bienvenido a Horus Barber · Alcobendas</div>
            </div>
            {ultimaCita && (
              <button onClick={reservaExpres} style={{ width: "100%", marginBottom: 14, padding: "12px 14px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, color: "#f0ece4", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c9a84c" }}>⚡ Reserva exprés</div>
                  <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)" }}>{ultimaCita.servicio} · {ultimaCita.hora}</div>
                </div>
                <div style={{ fontSize: 12, color: "#c9a84c" }}>→</div>
              </button>
            )}
            {/* Fidelidad */}
            <div style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.03))", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 14, padding: "13px 14px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c9a84c" }}>🏆 Programa Fidelidad</div>
                <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>{user?.visitas || 0}/6 cortes</div>
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= (user?.visitas || 0) ? "#c9a84c" : "rgba(255,255,255,0.08)" }} />
                ))}
              </div>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>
                {(user?.visitas || 0) >= 6 ? "🎉 ¡Tienes un corte gratis! Avísanos." : `Faltan ${6 - (user?.visitas || 0)} cortes para el gratis`}
              </div>
            </div>
            {/* Promos */}
            {promos.filter((p) => p.activa).map((p) => (
              <div key={p.id} style={{ background: "linear-gradient(135deg,rgba(224,123,84,0.1),rgba(224,123,84,0.03))", border: "1px solid rgba(224,123,84,0.15)", borderRadius: 12, padding: "11px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e07b54" }}>{p.titulo}</div>
                  <div style={{ fontSize: 11, color: "rgba(240,236,228,0.45)" }}>{p.desc}</div>
                </div>
                <div style={{ fontSize: 10, color: "#c9a84c", fontWeight: 600, background: "rgba(201,168,76,0.1)", padding: "4px 8px", borderRadius: 6 }}>{p.codigo}</div>
              </div>
            ))}
            {/* Espera */}
            <div className="glass" style={{ borderRadius: 14, padding: "11px 14px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>⏱ Espera sin cita</div>
                <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)" }}>{tiempoEspera === 0 ? "Sin espera ahora mismo" : `~${tiempoEspera} min de espera`}</div>
              </div>
              <button className="btn-gold" onClick={() => setScreen("reservar")} style={{ padding: "8px 14px", fontSize: 11, borderRadius: 9 }}>Reservar</button>
            </div>
            {/* Info barbería */}
            <div className="glass" style={{ borderRadius: 16, padding: 14, marginBottom: 14 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{INFO.barberia}</div>
              <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)", marginBottom: 2 }}>📍 {INFO.direccion}</div>
              <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)", marginBottom: 2 }}>🕐 {INFO.horario}</div>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.3)", marginBottom: 10 }}>☕ {INFO.descanso}</div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="btn-gold" onClick={() => setScreen("reservar")} style={{ flex: 1, padding: "9px", fontSize: 12, borderRadius: 10 }}>Reservar cita</button>
                <button onClick={() => window.open(INFO.maps, "_blank")} style={{ flex: 1, padding: "9px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0ece4", fontSize: 12, cursor: "pointer" }}>Ver en mapa</button>
              </div>
            </div>
            {/* Servicios */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(240,236,228,0.5)", marginBottom: 8 }}>SERVICIOS</div>
            {SERVICIOS.map((s) => (
              <div key={s.id} className="glass hover-scale" onClick={() => { setSelectedServicio(s); setScreen("reservar"); }} style={{ borderRadius: 12, padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ fontSize: 20 }}>{s.emoji}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.nombre}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>{s.duracion}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.precio}€</div>
              </div>
            ))}
            {/* Bonos */}
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(240,236,228,0.5)", marginBottom: 8, marginTop: 4 }}>BONOS</div>
            {BONOS.map((b) => (
              <div key={b.id} className="glass hover-scale" onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola! Me interesa el ${b.nombre}`, "_blank")} style={{ borderRadius: 12, padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ fontSize: 20 }}>{b.emoji}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.nombre}</div>
                    <div style={{ fontSize: 10, color: "#25d366" }}>Ahorras {b.ahorro}€</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: b.color }}>{b.precio}€</div>
              </div>
            ))}
            {/* Reseñas */}
            {resenas.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(240,236,228,0.5)", marginBottom: 8, marginTop: 4 }}>RESEÑAS</div>
                {resenas.slice(0, 2).map((r) => (
                  <div key={r.id} className="glass" style={{ borderRadius: 12, padding: "11px 13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{r.nombre}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,236,228,0.3)" }}>{r.fecha}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#c9a84c", marginBottom: 3 }}>{"★".repeat(r.estrellas)}</div>
                    <div style={{ fontSize: 11, color: "rgba(240,236,228,0.55)", lineHeight: 1.4 }}>{r.texto}</div>
                  </div>
                ))}
              </>
            )}
            <div style={{ display: "flex", gap: 7, marginTop: 4 }}>
              <button onClick={() => setScreen("resenas")} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, color: "rgba(240,236,228,0.6)", fontSize: 11, cursor: "pointer" }}>Ver reseñas</button>
              <button onClick={() => window.open(`https://instagram.com/${INSTAGRAM}`, "_blank")} style={{ flex: 1, padding: "10px", background: "rgba(193,53,132,0.08)", border: "1px solid rgba(193,53,132,0.15)", borderRadius: 10, color: "#c13584", fontSize: 11, cursor: "pointer" }}>📸 Instagram</button>
            </div>
          </div>
        )}

        {/* ── RESERVAR ── */}
        {screen === "reservar" && (
          <div className="fade-in">
            <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 4 }}>Reservar cita</div>
            <div style={{ fontSize: 11, color: "rgba(240,236,228,0.35)", marginBottom: 16 }}>Elige servicio, fecha y hora</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#c9a84c", marginBottom: 8 }}>SERVICIO</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
              {SERVICIOS.map((s) => (
                <div key={s.id} onClick={() => setSelectedServicio(s)} style={{ borderRadius: 12, padding: 12, background: selectedServicio?.id === s.id ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedServicio?.id === s.id ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.nombre}</div>
                  <div style={{ fontSize: 9, color: "rgba(240,236,228,0.35)", marginBottom: 4 }}>{s.duracion}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.precio}€</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#c9a84c", marginBottom: 7 }}>FECHA</div>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#f0ece4", fontSize: 13, outline: "none", marginBottom: 12 }}
            />
            {diasBloqueados.includes(selectedFecha) && (
              <div style={{ background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.2)", borderRadius: 10, padding: "9px 12px", fontSize: 11, color: "#ff6b7a", marginBottom: 12 }}>
                🚫 Este día no está disponible. Por favor elige otra fecha.
              </div>
            )}
            {selectedFecha && !diasBloqueados.includes(selectedFecha) && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#c9a84c", marginBottom: 7 }}>HORARIO</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 16 }}>
                  {HORARIOS_BASE.map((h) => {
                    const ocupado = horariosOcupados.includes(h);
                    return (
                      <button key={h} onClick={() => !ocupado && setSelectedHorario(h)} style={{ padding: "8px 4px", background: ocupado ? "rgba(220,53,69,0.08)" : selectedHorario === h ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${ocupado ? "rgba(220,53,69,0.2)" : selectedHorario === h ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`, borderRadius: 8, color: ocupado ? "rgba(240,236,228,0.2)" : selectedHorario === h ? "#c9a84c" : "#f0ece4", fontSize: 11, cursor: ocupado ? "not-allowed" : "pointer" }}>
                        {h}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {selectedServicio && selectedFecha && selectedHorario && (
              <div className="glass" style={{ borderRadius: 14, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)", marginBottom: 9, fontWeight: 600 }}>RESUMEN</div>
                {[["Servicio", selectedServicio.nombre, selectedServicio.color], ["Precio", `${selectedServicio.precio}€`, "#c9a84c"], ["Fecha", selectedFecha, null], ["Hora", selectedHorario, null]].map(([k, v, c]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(240,236,228,0.35)" }}>{k}</span>
                    <span style={{ fontSize: 11, color: c || "#f0ece4", fontWeight: c ? 600 : 400 }}>{v}</span>
                  </div>
                ))}
                <div style={{ fontSize: 10, color: "rgba(240,236,228,0.3)", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  ⚠️ Cancelación con menos de 24h: se cobra señal de 5€
                </div>
              </div>
            )}
            <button onClick={async () => {
              if (!selectedServicio) { alert("Elige un servicio."); return; }
              if (!selectedFecha) { alert("Elige una fecha."); return; }
              if (diasBloqueados.includes(selectedFecha)) { alert("Día bloqueado."); return; }
              if (!selectedHorario) { alert("Elige un horario."); return; }
              const nombre = user?.name || "Cliente";
              const email = user?.email || "";
              const nuevaCita = {
                servicio: selectedServicio.nombre,
                precio: selectedServicio.precio,
                fecha: selectedFecha,
                hora: selectedHorario,
              };
              await db.post("reservas", { nombre, email, ...nuevaCita });
              enviarConfirmacion(nombre, email, selectedServicio.nombre, selectedFecha, selectedHorario);
              enviarWhatsApp(selectedServicio.nombre, selectedHorario, selectedFecha, nombre);
              setBookings((p) => [...p, nuevaCita]);
              setUltimaCita(nuevaCita);
              addNotification("📅 ¡Cita reservada!", `${selectedServicio.nombre} el ${selectedFecha} a las ${selectedHorario}`);
              setScreen("miscitas");
            }} style={{ width: "100%", padding: "14px", fontSize: 13, borderRadius: 14, background: "linear-gradient(135deg,#25d366,#1da851)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
              💬 Confirmar por WhatsApp
            </button>
            <div style={{ textAlign: "center", fontSize: 9, color: "rgba(240,236,228,0.2)", marginTop: 8 }}>
              Al confirmar se abrirá WhatsApp para finalizar la reserva
            </div>
          </div>
        )}

        {/* ── GALERÍA ── */}
        {screen === "galeria" && (
          <div className="fade-in">
            <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 4 }}>Galería</div>
            <div style={{ fontSize: 11, color: "rgba(240,236,228,0.35)", marginBottom: 16 }}>Nuestros mejores trabajos</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {GALERIA.map((g) => (
                <div key={g.id} onClick={() => window.open(g.url, "_blank")} style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", transition: "transform 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                  <img src={g.img} alt={g.titulo} style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                    onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop")} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.7))", padding: "20px 8px 8px" }}>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{g.titulo}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => window.open(`https://instagram.com/${INSTAGRAM}`, "_blank")} style={{ width: "100%", padding: "11px", background: "rgba(193,53,132,0.1)", border: "1px solid rgba(193,53,132,0.2)", borderRadius: 12, color: "#c13584", fontSize: 13, cursor: "pointer", marginBottom: 10 }}>
              📸 Ver más en @{INSTAGRAM}
            </button>
            <button onClick={() => setScreen("reservar")} className="btn-gold" style={{ width: "100%", padding: "12px", fontSize: 13, borderRadius: 12 }}>
              Reservar mi cita
            </button>
          </div>
        )}

        {/* ── ESTILO ── */}
        {screen === "estilo" && (
          <div className="fade-in">
            <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 4 }}>Analizador de estilo</div>
            <div style={{ fontSize: 11, color: "rgba(240,236,228,0.35)", marginBottom: 16 }}>IA para recomendar tu corte ideal</div>
            <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🪄</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Análisis de estilo con IA</div>
              <div style={{ fontSize: 11, color: "rgba(240,236,228,0.4)", marginBottom: 14, lineHeight: 1.6 }}>
                Sube una foto de tu cara y nuestra IA analizará tu forma y te recomendará los mejores cortes para ti
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const base64 = ev.target.result.split(",")[1];
                  setFotoEstilo(ev.target.result);
                  analizarEstilo(base64);
                };
                reader.readAsDataURL(file);
              }} />
              {!fotoEstilo ? (
                <button className="btn-gold" onClick={() => fileRef.current.click()} style={{ width: "100%", padding: "12px", fontSize: 13, borderRadius: 12 }}>
                  📷 Subir foto
                </button>
              ) : (
                <div>
                  <img src={fotoEstilo} alt="Tu foto" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: "2px solid rgba(201,168,76,0.3)" }} />
                  <button onClick={() => fileRef.current.click()} style={{ display: "block", margin: "0 auto", background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 11, cursor: "pointer" }}>
                    Cambiar foto
                  </button>
                </div>
              )}
            </div>
            {analizando && (
              <div className="glass" style={{ borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
                  {[0,1,2].map((i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#c9a84c", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
                <div style={{ fontSize: 12, color: "rgba(240,236,228,0.4)" }}>Analizando tu estilo...</div>
              </div>
            )}
            {recomendacion && !analizando && (
              <div className="glass" style={{ borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c9a84c", marginBottom: 10 }}>✨ Recomendación personalizada</div>
                <div style={{ fontSize: 12, color: "rgba(240,236,228,0.7)", lineHeight: 1.6 }}>{recomendacion}</div>
                <button className="btn-gold" onClick={() => setScreen("reservar")} style={{ width: "100%", padding: "11px", fontSize: 12, borderRadius: 10, marginTop: 14 }}>
                  Reservar con este estilo
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CHAT ── */}
        {screen === "chat" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>Asistente Horus</div>
              <div style={{ fontSize: 9, color: "#c9a84c" }}>● En línea · Pregúntame lo que quieras</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "83%", padding: "9px 13px", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: msg.role === "user" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${msg.role === "user" ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.07)"}`, fontSize: 12, lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", gap: 4, padding: "9px 13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px 14px 14px 4px", width: "fit-content" }}>
                  {[0,1,2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#c9a84c", animation: `pulse 1s ${i * 0.15}s infinite` }} />)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 6, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 8 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Escribe tu mensaje..."
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#f0ece4", fontSize: 12, outline: "none" }}
              />
              <button className="btn-gold" onClick={sendMessage} style={{ padding: "10px 13px", borderRadius: 10, fontSize: 16 }}>→</button>
            </div>
          </div>
        )}

        {/* ── MIS CITAS ── */}
        {screen === "miscitas" && (
          <div className="fade-in">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Mis citas</div>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)", marginTop: 2 }}>{bookings.length} reserva(s)</div>
            </div>
            {bookings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "44px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <div style={{ color: "rgba(240,236,228,0.35)", marginBottom: 16, fontSize: 12 }}>No tienes citas aún</div>
                <button className="btn-gold" onClick={() => setScreen("reservar")} style={{ padding: "12px 24px", fontSize: 13, borderRadius: 12 }}>Reservar ahora</button>
              </div>
            ) : bookings.map((b, i) => (
              <div key={i} className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.servicio}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>📆 {b.fecha} · 🕐 {b.hora}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#c9a84c" }}>{b.precio}€</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => enviarWhatsApp(b.servicio, b.hora, b.fecha, user?.name)} style={{ flex: 1, padding: "8px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.15)", borderRadius: 8, color: "#25d366", fontSize: 10, cursor: "pointer" }}>💬 WhatsApp</button>
                  <button onClick={() => enviarRecordatorio(b)} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, color: "rgba(240,236,228,0.6)", fontSize: 10, cursor: "pointer" }}>⏰ Recordatorio</button>
                </div>
              </div>
            ))}
            {bookings.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(240,236,228,0.45)", marginBottom: 8 }}>DEJA TU RESEÑA</div>
                <div className="glass" style={{ borderRadius: 13, padding: 13 }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setNuevaResena((r) => ({ ...r, estrellas: n }))} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", opacity: n <= nuevaResena.estrellas ? 1 : 0.3 }}>★</button>
                    ))}
                  </div>
                  <textarea
                    value={nuevaResena.texto}
                    onChange={(e) => setNuevaResena((r) => ({ ...r, texto: e.target.value }))}
                    placeholder="Cuéntanos tu experiencia..."
                    rows={3}
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 12, outline: "none", resize: "none", marginBottom: 9 }}
                  />
                  <button className="btn-gold" onClick={() => {
                    if (!nuevaResena.texto.trim()) return;
                    setResenas((p) => [{ id: Date.now(), nombre: user?.name || "Cliente", estrellas: nuevaResena.estrellas, texto: nuevaResena.texto, fecha: new Date().toLocaleDateString("es-ES") }, ...p]);
                    setNuevaResena({ estrellas: 5, texto: "" });
                    addNotification("⭐ ¡Gracias por tu reseña!", "Tu opinión ayuda a otros clientes.");
                  }} style={{ width: "100%", padding: "9px", fontSize: 12, borderRadius: 9 }}>
                    Publicar reseña
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESEÑAS ── */}
        {screen === "resenas" && (
          <div className="fade-in">
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 14 }}>← Volver</button>
            <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginBottom: 4 }}>Reseñas</div>
            <div style={{ fontSize: 11, color: "rgba(240,236,228,0.35)", marginBottom: 14 }}>Lo que dicen nuestros clientes</div>
            {resenas.length === 0 && <div style={{ textAlign: "center", color: "rgba(240,236,228,0.3)", fontSize: 12, padding: "30px 0" }}>Aún no hay reseñas. ¡Sé el primero!</div>}
            {resenas.map((r) => (
              <div key={r.id} className="glass" style={{ borderRadius: 12, padding: "11px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ fontSize: 9, color: "rgba(240,236,228,0.25)" }}>{r.fecha}</div>
                </div>
                <div style={{ fontSize: 11, color: "#c9a84c", marginBottom: 3 }}>{"★".repeat(r.estrellas)}</div>
                <div style={{ fontSize: 11, color: "rgba(240,236,228,0.55)", lineHeight: 1.4 }}>{r.texto}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── PERFIL ── */}
        {screen === "perfil" && user && (
          <div className="fade-in">
            <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 14 }}>← Volver</button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 66, height: 66, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#e8c97a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#0a0a0a", margin: "0 auto 10px" }}>
                {user.name[0].toUpperCase()}
              </div>
              <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "rgba(240,236,228,0.35)", marginTop: 2 }}>{user.email}</div>
            </div>
            {[["📋","Mis citas", bookings.length, () => setScreen("miscitas")], ["⭐","Reseñas", resenas.length, () => setScreen("resenas")]].map(([icon, label, count, action]) => (
              <div key={label} className="glass hover-scale" onClick={action} style={{ borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12 }}>{icon} {label}</div>
                <div style={{ fontSize: 11, color: "#c9a84c", fontWeight: 600 }}>{count}</div>
              </div>
            ))}
            <div className="glass" style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.3)", marginBottom: 5 }}>BARBERÍA</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{INFO.barberia}</div>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)", marginBottom: 2 }}>📍 {INFO.direccion}</div>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>📞 +{WHATSAPP_NUMBER}</div>
            </div>
            {/* Panel admin */}
            <div className="glass" style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "rgba(240,236,228,0.3)", marginBottom: 7 }}>🔒 ACCESO ADMIN</div>
              <input
                type="password"
                placeholder="PIN (4 dígitos)"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "9px 12px", color: "#f0ece4", fontSize: 13, outline: "none", marginBottom: 8 }}
              />
              <button
                onClick={() => { if (adminPin === ADMIN_PIN) { setIsAdmin(true); setScreen("admin"); } else { alert("PIN incorrecto"); } }}
                style={{ width: "100%", padding: "9px", borderRadius: 9, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#c9a84c", fontSize: 12, cursor: "pointer" }}
              >
                Entrar como admin
              </button>
            </div>
            <button onClick={() => { setAuthStep("splash"); setUser(null); setIsAdmin(false); }} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.15)", color: "#ff6b7a", fontSize: 13, cursor: "pointer" }}>
              Cerrar sesión
            </button>
          </div>
        )}

        {/* ── ADMIN ── */}
        {screen === "admin" && isAdmin && (
          <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontFamily: "'Playfair Display',serif", fontWeight: 700 }}>Panel Admin</div>
                <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>Horus Barber · Vista administrador</div>
              </div>
              <button onClick={() => setScreen("perfil")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 13, cursor: "pointer" }}>← Salir</button>
            </div>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 12 }}>
              {[["📅", bookings.length, "Citas"], ["💰", totalIngresos + "€", "Ingresos"], ["✂️", topServicio, "Top servicio"]].map(([icon, value, label]) => (
                <div key={label} className="glass" style={{ borderRadius: 11, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 18 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c", marginTop: 2 }}>{value}</div>
                  <div style={{ fontSize: 9, color: "rgba(240,236,228,0.35)", marginTop: 1 }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Agregar cita */}
            <div className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>➕ Agregar cita manual</div>
              <div style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 10, color: "rgba(240,236,228,0.4)", marginBottom: 4 }}>Nombre cliente</div>
                <input value={adminForm.nombre} onChange={(e) => setAdminForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#f0ece4", fontSize: 12, outline: "none" }} />
              </div>
              <div style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 10, color: "rgba(240,236,228,0.4)", marginBottom: 4 }}>Servicio</div>
                <select value={adminForm.servicio} onChange={(e) => {
                  const s = SERVICIOS.find((x) => x.nombre === e.target.value);
                  setAdminForm((f) => ({ ...f, servicio: e.target.value, precio: s?.precio || 13 }));
                }} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#f0ece4", fontSize: 12, outline: "none" }}>
                  {SERVICIOS.map((s) => <option key={s.id} value={s.nombre} style={{ background: "#1a1a1a" }}>{s.nombre} — {s.precio}€</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 7, marginBottom: 7 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "rgba(240,236,228,0.4)", marginBottom: 4 }}>Fecha</div>
                  <input type="date" value={adminForm.fecha} onChange={(e) => setAdminForm((f) => ({ ...f, fecha: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#f0ece4", fontSize: 12, outline: "none" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: "rgba(240,236,228,0.4)", marginBottom: 4 }}>Hora</div>
                  <select value={adminForm.hora} onChange={(e) => setAdminForm((f) => ({ ...f, hora: e.target.value }))} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#f0ece4", fontSize: 12, outline: "none" }}>
                    {HORARIOS_BASE.map((h) => <option key={h} value={h} style={{ background: "#1a1a1a" }}>{h}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-gold" onClick={async () => {
                if (!adminForm.nombre || !adminForm.fecha) { alert("Rellena nombre y fecha."); return; }
                const nuevaCita = { servicio: adminForm.servicio, precio: adminForm.precio, fecha: adminForm.fecha, hora: adminForm.hora };
                await db.post("reservas", { ...nuevaCita, email: "manual" });
                setBookings((p) => [...p, nuevaCita]);
                addNotification("📅 Cita añadida", `${adminForm.nombre} · ${adminForm.servicio}`);
                setAdminForm({ nombre: "", servicio: "Corte", fecha: "", hora: "10:00", precio: 13 });
                alert("✅ Cita añadida correctamente");
              }} style={{ width: "100%", padding: "10px", fontSize: 12, borderRadius: 10 }}>
                ➕ Guardar cita
              </button>
            </div>
            {/* Tiempo de espera */}
            <div className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>⏱ Tiempo de espera actual</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[0,15,20,30,45,60].map((t) => (
                  <button key={t} onClick={() => setTiempoEspera(t)} style={{ padding: "7px 12px", borderRadius: 8, background: tiempoEspera === t ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${tiempoEspera === t ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.07)"}`, color: tiempoEspera === t ? "#c9a84c" : "rgba(240,236,228,0.6)", fontSize: 11, cursor: "pointer" }}>
                    {t === 0 ? "Sin espera" : `${t} min`}
                  </button>
                ))}
              </div>
            </div>
            {/* Bloquear días */}
            <div className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>🚫 Bloquear días</div>
              <input type="date" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#f0ece4", fontSize: 12, outline: "none", marginBottom: 8 }}
                onChange={(e) => {
                  const fecha = e.target.value;
                  if (!fecha) return;
                  if (diasBloqueados.includes(fecha)) {
                    setDiasBloqueados((p) => p.filter((d) => d !== fecha));
                    addNotification("✅ Día desbloqueado", `${fecha} disponible de nuevo.`);
                  } else {
                    setDiasBloqueados((p) => [...p, fecha]);
                    addNotification("🚫 Día bloqueado", `${fecha} marcado como no disponible.`);
                  }
                }} />
              {diasBloqueados.map((d) => (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#ff6b7a" }}>🚫 {d}</span>
                  <button onClick={() => setDiasBloqueados((p) => p.filter((x) => x !== d))} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.4)", fontSize: 11, cursor: "pointer" }}>✕</button>
                </div>
              ))}
            </div>
            {/* Avisos */}
            <div className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>📣 Avisos a clientes</div>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=💈 *Horus Barber* — Tenemos un hueco disponible ahora mismo. ¿Te apuntas?`, "_blank")} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.15)", color: "#25d366", fontSize: 12, cursor: "pointer", marginBottom: 8 }}>
                💬 Avisar de hueco disponible
              </button>
              <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=🎉 *Horus Barber* — ¡Promoción especial! ${promos[0]?.desc || ""}`, "_blank")} style={{ width: "100%", padding: "10px", borderRadius: 10, background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", color: "#c9a84c", fontSize: 12, cursor: "pointer" }}>
                🎉 Enviar promoción
              </button>
            </div>
            {/* Lista reservas */}
            <div className="glass" style={{ borderRadius: 14, padding: 13, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>📋 Reservas ({bookings.length})</div>
              {bookings.length === 0 ? (
                <div style={{ fontSize: 11, color: "rgba(240,236,228,0.25)", textAlign: "center", padding: "10px 0" }}>Sin reservas aún</div>
              ) : bookings.sort((a, b) => a.fecha > b.fecha ? 1 : -1).map((b, i) => (
                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{b.servicio}</div>
                      <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>📆 {b.fecha} · 🕐 {b.hora}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c" }}>{b.precio}€</div>
                  </div>
                  <button onClick={() => enviarRecordatorio(b)} style={{ marginTop: 5, padding: "5px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, color: "rgba(240,236,228,0.5)", fontSize: 10, cursor: "pointer" }}>
                    ⏰ Enviar recordatorio 24h
                  </button>
                </div>
              ))}
            </div>
            {/* Promociones */}
            <div className="glass" style={{ borderRadius: 14, padding: 13 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 9 }}>🎉 Promociones</div>
              {promos.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{p.titulo}</div>
                    <div style={{ fontSize: 10, color: "rgba(240,236,228,0.35)" }}>{p.desc}</div>
                  </div>
                  <button
                    onClick={() => setPromos((prev) => prev.map((x) => x.id === p.id ? { ...x, activa: !x.activa } : x))}
                    style={{ padding: "4px 9px", borderRadius: 7, border: "none", cursor: "pointer", background: p.activa ? "rgba(37,211,102,0.15)" : "rgba(255,255,255,0.05)", color: p.activa ? "#25d366" : "rgba(240,236,228,0.4)", fontSize: 10 }}
                  >
                    {p.activa ? "✓ Activa" : "Inactiva"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
