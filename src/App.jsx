import { useState, useRef, useEffect } from "react";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bbkwbmxaqserojttseaj.supabase.co";
const SUPABASE_KEY = "sb_publishable_Cy-Qi1Jd-EPbC6bRkEPYxg_f0PdFGMy";
const ADMIN_PIN = "1234";
const WHATSAPP_NUMBER = "34603768132";

const db = {
  async post(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:"POST", headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=minimal"},
      body:JSON.stringify(data)
    });
    return res.ok;
  },
  async get(table, query="") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`}
    });
    return res.ok ? await res.json() : [];
  },
  async patch(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`},
      body:JSON.stringify(data)
    });
    return res.ok;
  }
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const SERVICIOS = [
  { id:1, nombre:"Corte", precio:13, duracion:"30 min", emoji:"✂️", color:"#c9a84c" },
  { id:2, nombre:"Corte + Cejas", precio:15, duracion:"40 min", emoji:"✨", color:"#e07b54" },
  { id:3, nombre:"Corte + Barba", precio:17, duracion:"50 min", emoji:"🧔", color:"#7b9e87" },
  { id:4, nombre:"Corte Premium", precio:20, duracion:"60 min", emoji:"👑", color:"#5b8dd9" },
];

const HORARIOS_BASE = ["10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"];

const GALERIA = [
  { id:1, img:"https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop", titulo:"Fade Clásico", likes:24 },
  { id:2, img:"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop", titulo:"Corte + Barba", likes:31 },
  { id:3, img:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop", titulo:"Fade Moderno", likes:18 },
  { id:4, img:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop", titulo:"Corte Texturizado", likes:27 },
  { id:5, img:"https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop", titulo:"Barba Perfilada", likes:15 },
  { id:6, img:"https://images.unsplash.com/photo-1582095133179-bfd08e2979d9?w=400&h=400&fit=crop", titulo:"Skin Fade", likes:33 },
];

const INFO = {
  nombre:"Horus Barber",
  barberia:"Barbería de Horus",
  direccion:"Calle Constitución 4, Alcobendas",
  horario:"Lun - Sáb · 10:00 - 21:30",
  descanso:"Descanso 14:30 - 16:30",
  maps:"https://maps.google.com/?q=Calle+Constitucion+4+Alcobendas+Madrid",
};

const CHAT_SYSTEM = `Eres el asistente IA de Horus Barber, una barbería premium en Alcobendas, Madrid.
Dirección: Calle Constitución 4, Alcobendas. Horario: Lun-Sáb 10:00-21:30, descanso 14:30-16:30.
Servicios: Corte 13€ (30min), Corte+Cejas 15€ (40min), Corte+Barba 17€ (50min), Corte Premium 20€ (60min).
WhatsApp: +34 603 768 132. Programa fidelidad: cada 5 cortes el 6º gratis.
Responde en español, amigable y profesional. Ayuda con reservas, precios, horarios y consejos de estilo.`;

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HorusApp() {
  const [authStep, setAuthStep] = useState("splash");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", code:"" });
  const [formError, setFormError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState("");
  const [bookings, setBookings] = useState([]);
  const [allReservas, setAllReservas] = useState([]);
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [resenas, setResenas] = useState([
    { id:1, nombre:"Carlos M.", estrellas:5, texto:"El mejor barbero de Alcobendas, sin duda.", fecha:"Hace 2 días" },
    { id:2, nombre:"Javier R.", estrellas:5, texto:"Siempre salgo contento. Muy recomendable.", fecha:"Hace 1 semana" },
    { id:3, nombre:"Miguel A.", estrellas:4, texto:"Excelente trabajo y muy puntual.", fecha:"Hace 2 semanas" },
  ]);
  const [nuevaResena, setNuevaResena] = useState({ estrellas:5, texto:"" });
  const [notifications, setNotifications] = useState([
    { id:1, title:"¡Bienvenido a Horus Barber! 🎉", body:"Reserva tu primera cita ahora.", time:"ahora", read:false },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [promos, setPromos] = useState([
    { id:1, titulo:"🎉 Corte Premium", desc:"Esta semana 20€ → 15€", activa:true, countdown:"3 días" },
  ]);
  const [chatMessages, setChatMessages] = useState([
    { role:"assistant", content:"¡Hola! 👋 Soy el asistente de Horus Barber. ¿En qué puedo ayudarte?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [listaEspera, setListaEspera] = useState([]);
  const chatEndRef = useRef(null);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selectedFecha) {
      db.get("reservas", `fecha=eq.${selectedFecha}`).then(data => {
        setHorariosOcupados(data.map(r => r.hora));
      });
    }
  }, [selectedFecha]);

  const addNotification = (title, body) => {
    setNotifications(prev => [{ id:Date.now(), title, body, time:"ahora", read:false }, ...prev]);
  };

  const enviarWhatsApp = (servicio, hora, fecha, nombre) => {
    const msg = `¡Hola Horus! Quiero reservar 💈%0A%0A👤 *${nombre}*%0A✂️ *${servicio}*%0A📅 *${fecha}*%0A🕐 *${hora}*%0A%0A¡Gracias!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const enviarRecordatorio = (booking) => {
    const msg = `⏰ Recordatorio de cita%0A%0AHola ${booking.nombre || user?.name}! Te recordamos tu cita mañana:%0A✂️ ${booking.servicio}%0A🕐 ${booking.hora}%0A📍 C/ Constitución 4, Alcobendas%0A%0A¡Te esperamos! - Horus Barber 💈`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleLogin = async () => {
    setFormError("");
    if (!form.email || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Contraseña muy corta."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setUser({ name:form.email.split("@")[0], email:form.email, visitas:0 });
    setAuthLoading(false);
    setAuthStep("app");
  };

  const handleRegister = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Mínimo 6 caracteres."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setAuthLoading(false);
    setAuthStep("verify");
  };

  const handleVerify = async () => {
    setFormError("");
    if (form.code.length !== 6) { setFormError("El código tiene 6 dígitos."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ name:form.name, email:form.email, phone:form.phone, visitas:0 });
    setAuthLoading(false);
    setAuthStep("app");
    addNotification("✅ ¡Bienvenido!", `Hola ${form.name}, tu cuenta está lista.`);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role:"user", content:userMsg }]);
    setIsTyping(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:800, system:CHAT_SYSTEM,
          messages:[...chatMessages.map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}] })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role:"assistant", content:data.content?.[0]?.text || "Error." }]);
    } catch { setChatMessages(prev => [...prev, { role:"assistant", content:"Error de conexión." }]); }
    setIsTyping(false);
  };

  const base = { fontFamily:"'DM Sans', sans-serif", background:"#0a0a0a", minHeight:"100vh", color:"#f0ece4", display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden" };

  // ── SPLASH ──
  if (authStep === "splash") return (
    <div style={{...base, justifyContent:"center", alignItems:"center", minHeight:"100vh"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(224,123,84,0.1) 0%, transparent 50%)"}}/>
      <div style={{textAlign:"center",zIndex:1,padding:36,width:"100%"}}>
        <HorusLogo size={100} style={{margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:50,fontWeight:900,color:"#c9a84c",letterSpacing:"-2px",lineHeight:1}}>HORUS</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"rgba(240,236,228,0.5)",marginTop:4}}>Barber</div>
        <div style={{fontSize:11,letterSpacing:"4px",color:"rgba(240,236,228,0.25)",marginTop:4,marginBottom:20}}>ALCOBENDAS · MADRID</div>

        {promos.filter(p=>p.activa).map(p=>(
          <div key={p.id} style={{background:"linear-gradient(135deg,rgba(201,168,76,0.15),rgba(224,123,84,0.1))",border:"1px solid rgba(201,168,76,0.3)",borderRadius:14,padding:"10px 16px",marginBottom:20,fontSize:13}}>
            <span style={{color:"#c9a84c",fontWeight:600}}>{p.titulo}</span> — {p.desc} <span style={{color:"rgba(240,236,228,0.4)"}}>· {p.countdown}</span>
          </div>
        ))}

        <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"12px 16px",marginBottom:28,fontSize:12,color:"rgba(240,236,228,0.5)"}}>
          📍 {INFO.direccion}<br/>🕐 {INFO.horario}
        </div>

        <button className="btn-gold" onClick={()=>setAuthStep("register")} style={{width:"100%",padding:"16px",fontSize:16,borderRadius:18,marginBottom:12}}>
          Reservar mi cita
        </button>
        <button onClick={()=>setAuthStep("login")} style={{width:"100%",padding:"14px",fontSize:14,borderRadius:18,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ece4",cursor:"pointer",marginBottom:12}}>
          Ya tengo cuenta
        </button>
        <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{width:"100%",padding:"13px",fontSize:14,borderRadius:16,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",cursor:"pointer",fontWeight:600}}>
          💬 WhatsApp directo
        </button>
      </div>
    </div>
  );

  // ── LOGIN ──
  if (authStep === "login") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:28,fontSize:14}}>← Volver</button>
        <HorusLogo size={44} style={{marginBottom:14}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Bienvenido 👋</div>
        <div style={{color:"rgba(240,236,228,0.4)",fontSize:13,marginBottom:32}}>Inicia sesión para gestionar tus citas</div>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleLogin} disabled={authLoading} style={{width:"100%",padding:"15px",fontSize:15,borderRadius:18,marginBottom:14,opacity:authLoading?0.7:1}}>{authLoading?<Spinner/>:"Iniciar sesión"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿No tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("register")}>Regístrate</span></div>
      </div>
    </div>
  );

  // ── REGISTER ──
  if (authStep === "register") return (
    <div style={{...base, padding:"40px 28px", overflowY:"auto"}}>
      <Fonts/><GlobalStyles/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:28,fontSize:14}}>← Volver</button>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Crear cuenta 👁️</div>
        <div style={{color:"rgba(240,236,228,0.4)",fontSize:13,marginBottom:28}}>Para gestionar tus citas y acumular puntos</div>
        <AuthInput label="Nombre completo" placeholder="Tu nombre" value={form.name} onChange={v=>setForm({...form,name:v})}/>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Teléfono" type="tel" placeholder="+34 600 000 000" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        <div style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:12,padding:"11px 14px",fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:18,lineHeight:1.5}}>
          🎁 Al registrarte entras en el <strong style={{color:"#c9a84c"}}>programa de fidelidad</strong> — cada 5 cortes el 6º gratis.
        </div>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleRegister} disabled={authLoading} style={{width:"100%",padding:"15px",fontSize:15,borderRadius:18,marginBottom:14,opacity:authLoading?0.7:1}}>{authLoading?<Spinner/>:"Crear cuenta →"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿Ya tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("login")}>Inicia sesión</span></div>
      </div>
    </div>
  );

  // ── VERIFY ──
  if (authStep === "verify") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("register")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:28,fontSize:14}}>← Volver</button>
        <div style={{fontSize:52,textAlign:"center",marginBottom:14}}>📱</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:"#c9a84c",textAlign:"center",marginBottom:6}}>Verificación SMS</div>
        <div style={{color:"rgba(240,236,228,0.4)",fontSize:13,textAlign:"center",marginBottom:28,lineHeight:1.5}}>Código enviado a<br/><strong style={{color:"#f0ece4"}}>{form.phone}</strong></div>
        <input type="text" maxLength={6} placeholder="000000" value={form.code} onChange={e=>setForm({...form,code:e.target.value.replace(/\D/g,"")})}
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:"16px",color:"#c9a84c",fontSize:30,textAlign:"center",letterSpacing:10,outline:"none",marginBottom:14,fontFamily:"'Playfair Display',serif",fontWeight:700}}/>
        <div style={{background:"rgba(91,141,217,0.1)",border:"1px solid rgba(91,141,217,0.2)",borderRadius:12,padding:"10px 14px",fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:18,textAlign:"center"}}>
          💡 Demo: usa <strong style={{color:"#5b8dd9"}}>123456</strong>
        </div>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleVerify} disabled={authLoading} style={{width:"100%",padding:"15px",fontSize:15,borderRadius:18,opacity:authLoading?0.7:1}}>{authLoading?<Spinner/>:"Verificar y entrar ✓"}</button>
      </div>
    </div>
  );

  // ── MAIN APP ──
  return (
    <div style={base}>
      <Fonts/><GlobalStyles/>

      {/* Header */}
      <div style={{padding:"14px 18px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"rgba(10,10,10,0.96)",backdropFilter:"blur(20px)",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <HorusLogo size={32}/>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:"#c9a84c",lineHeight:1}}>HORUS</div>
            <div style={{fontSize:8,color:"rgba(240,236,228,0.25)",letterSpacing:"1.5px"}}>BARBER · ALCOBENDAS</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div ref={notifRef} style={{position:"relative"}}>
            <button onClick={()=>{setShowNotifs(!showNotifs);setNotifications(p=>p.map(n=>({...n,read:true})));}}
              style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
              🔔
              {unread>0 && <span style={{position:"absolute",top:-4,right:-4,background:"#e07b54",color:"white",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{position:"absolute",right:0,top:44,width:280,background:"#141414",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",zIndex:100,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:12,fontWeight:600}}>Notificaciones</div>
                {notifications.map(n=>(
                  <div key={n.id} style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{n.title}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.5)",lineHeight:1.4}}>{n.body}</div>
                    <div style={{fontSize:10,color:"rgba(240,236,228,0.3)",marginTop:2}}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div onClick={()=>setScreen("perfil")} style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,cursor:"pointer",fontWeight:700,color:"#0a0a0a"}}>
            {user?.name?.[0]?.toUpperCase()||"U"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",padding:"7px 12px",gap:4,background:"rgba(10,10,10,0.9)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        {[["home","🏠","Inicio"],["reservar","📅","Reservar"],["galeria","📷","Galería"],["chat","💬","IA"],["miscitas","✂️","Mis Citas"]].map(([tab,icon,label])=>(
          <button key={tab} onClick={()=>setScreen(tab)} style={{flex:1,padding:"7px 2px",borderRadius:10,border:"none",cursor:"pointer",fontSize:9,fontWeight:600,background:screen===tab?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.04)",color:screen===tab?"#0a0a0a":"rgba(240,236,228,0.4)",transition:"all 0.2s"}}>{icon}<br/>{label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px 80px"}}>

        {/* ── HOME ── */}
        {screen==="home" && (
          <div className="fade-in">
            <div style={{marginBottom:18}}>
              <div style={{fontSize:19,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:2}}>Buenas, {user?.name?.split(" ")[0]||"crack"} 👋</div>
              <div style={{color:"rgba(240,236,228,0.4)",fontSize:12}}>Bienvenido a Horus Barber</div>
            </div>

            {/* Fidelidad */}
            <div style={{background:"linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.05))",border:"1px solid rgba(201,168,76,0.25)",borderRadius:18,padding:"14px 16px",marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:13,fontWeight:600,color:"#c9a84c"}}>🎁 Programa Fidelidad</div>
                <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>Visitas: {user?.visitas||0}/5</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{flex:1,height:6,borderRadius:3,background:i<=(user?.visitas||0)?"#c9a84c":"rgba(255,255,255,0.1)"}}/>
                ))}
              </div>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginTop:6}}>
                {(user?.visitas||0)>=5?"🎉 ¡Tienes un corte gratis!":`Faltan ${5-(user?.visitas||0)} corte${5-(user?.visitas||0)!==1?"s":""} para tu próximo corte gratis`}
              </div>
            </div>

            {/* Promo activa */}
            {promos.filter(p=>p.activa).map(p=>(
              <div key={p.id} style={{background:"linear-gradient(135deg,rgba(224,123,84,0.15),rgba(201,168,76,0.08))",border:"1px solid rgba(224,123,84,0.3)",borderRadius:16,padding:"13px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#e07b54"}}>{p.titulo}</div>
                  <div style={{fontSize:12,color:"rgba(240,236,228,0.5)"}}>{p.desc}</div>
                </div>
                <div style={{fontSize:11,color:"#c9a84c",fontWeight:600,background:"rgba(201,168,76,0.1)",padding:"4px 10px",borderRadius:20}}>⏰ {p.countdown}</div>
              </div>
            ))}

            {/* Info barbería */}
            <div className="glass" style={{borderRadius:18,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#c9a84c",marginBottom:3}}>{INFO.barberia}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:2}}>📍 {INFO.direccion}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:2}}>🕐 {INFO.horario}</div>
                  <div style={{fontSize:10,color:"rgba(240,236,228,0.3)"}}>☕ {INFO.descanso}</div>
                </div>
                <div style={{background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:8,padding:"3px 8px",fontSize:10,color:"#25d366",fontWeight:600}}>Abierto</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-gold" onClick={()=>setScreen("reservar")} style={{flex:1,padding:"11px",fontSize:13,borderRadius:12}}>📅 Reservar</button>
                <button onClick={()=>window.open(INFO.maps,"_blank")} style={{flex:1,padding:"11px",fontSize:13,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ece4",cursor:"pointer"}}>🗺️ Cómo llegar</button>
              </div>
            </div>

            {/* Servicios */}
            <div style={{fontSize:13,fontWeight:600,color:"rgba(240,236,228,0.6)",marginBottom:10}}>✂️ Servicios</div>
            {SERVICIOS.map(s=>(
              <div key={s.id} className="glass hover-scale" onClick={()=>{setSelectedServicio(s);setScreen("reservar");}} style={{borderRadius:14,padding:"12px 14px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:22}}>{s.emoji}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{s.nombre}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>{s.duracion}</div>
                  </div>
                </div>
                <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.precio}€</div>
              </div>
            ))}

            {/* Reseñas */}
            <div style={{fontSize:13,fontWeight:600,color:"rgba(240,236,228,0.6)",marginBottom:10,marginTop:18}}>⭐ Reseñas de clientes</div>
            {resenas.slice(0,3).map(r=>(
              <div key={r.id} className="glass" style={{borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:12,fontWeight:600}}>{r.nombre}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.3)"}}>{r.fecha}</div>
                </div>
                <div style={{fontSize:13,color:"#c9a84c",marginBottom:4}}>{"★".repeat(r.estrellas)}{"☆".repeat(5-r.estrellas)}</div>
                <div style={{fontSize:12,color:"rgba(240,236,228,0.6)",lineHeight:1.4}}>{r.texto}</div>
              </div>
            ))}
            <button onClick={()=>setScreen("resenas")} style={{width:"100%",padding:"11px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(240,236,228,0.5)",cursor:"pointer",fontSize:13,marginBottom:10}}>Ver todas las reseñas →</button>
            <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{width:"100%",padding:"12px",fontSize:13,borderRadius:14,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",color:"#25d366",cursor:"pointer",fontWeight:600}}>
              💬 Contactar por WhatsApp
            </button>
          </div>
        )}

        {/* ── RESERVAR ── */}
        {screen==="reservar" && (
          <div className="fade-in">
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:3}}>Reservar cita 📅</div>
            <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:18}}>Barbería de Horus · Alcobendas</div>

            <div style={{fontSize:12,fontWeight:600,color:"#c9a84c",marginBottom:8}}>1️⃣ Elige tu servicio</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:20}}>
              {SERVICIOS.map(s=>(
                <div key={s.id} onClick={()=>setSelectedServicio(s)} style={{borderRadius:14,padding:"12px 10px",cursor:"pointer",border:`2px solid ${selectedServicio?.id===s.id?s.color:"rgba(255,255,255,0.07)"}`,background:selectedServicio?.id===s.id?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",transition:"all 0.2s",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:5}}>{s.emoji}</div>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{s.nombre}</div>
                  <div style={{fontSize:10,color:"rgba(240,236,228,0.4)",marginBottom:4}}>{s.duracion}</div>
                  <div style={{fontSize:16,fontWeight:700,color:s.color}}>{s.precio}€</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:600,color:"#c9a84c",marginBottom:8}}>2️⃣ Elige la fecha</div>
            <input type="date" value={selectedFecha} onChange={e=>setSelectedFecha(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 14px",color:"#f0ece4",fontSize:14,outline:"none",marginBottom:8,colorScheme:"dark"}}/>
            {diasBloqueados.includes(selectedFecha) && (
              <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#ff6b7a",marginBottom:14}}>
                ⛔ Este día no está disponible. Elige otra fecha.
              </div>
            )}

            {selectedFecha && !diasBloqueados.includes(selectedFecha) && (
              <>
                <div style={{fontSize:12,fontWeight:600,color:"#c9a84c",marginBottom:8}}>3️⃣ Elige el horario</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:20}}>
                  {HORARIOS_BASE.map(h=>{
                    const ocupado = horariosOcupados.includes(h);
                    return (
                      <button key={h} onClick={()=>!ocupado&&setSelectedHorario(h)} style={{padding:"9px 3px",borderRadius:10,border:"none",cursor:ocupado?"not-allowed":"pointer",fontSize:11,fontWeight:500,
                        background:ocupado?"rgba(255,255,255,0.03)":selectedHorario===h?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.06)",
                        color:ocupado?"rgba(240,236,228,0.2)":selectedHorario===h?"#0a0a0a":"#f0ece4",
                        textDecoration:ocupado?"line-through":"none",transition:"all 0.15s"}}>{h}</button>
                    );
                  })}
                </div>
              </>
            )}

            {selectedServicio && selectedFecha && selectedHorario && (
              <div className="glass" style={{borderRadius:16,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:10,fontWeight:600}}>Resumen</div>
                {[["Servicio",selectedServicio.nombre,selectedServicio.color],["Precio",`${selectedServicio.precio}€`,"#c9a84c"],["Fecha",selectedFecha,null],["Hora",selectedHorario,null]].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                    <span style={{fontSize:12,color:"rgba(240,236,228,0.4)"}}>{k}</span>
                    <span style={{fontSize:12,color:c||"#f0ece4",fontWeight:c?600:400}}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={async()=>{
              if (!selectedServicio){alert("Elige un servicio.");return;}
              if (!selectedFecha){alert("Elige una fecha.");return;}
              if (diasBloqueados.includes(selectedFecha)){alert("Día bloqueado.");return;}
              if (!selectedHorario){alert("Elige un horario.");return;}
              const nombre = user?.name||"Cliente";
              await db.post("reservas",{nombre,email:user?.email||"",servicio:selectedServicio.nombre,precio:selectedServicio.precio,fecha:selectedFecha,hora:selectedHorario});
              enviarWhatsApp(selectedServicio.nombre,selectedHorario,selectedFecha,nombre);
              setBookings(p=>[...p,{servicio:selectedServicio.nombre,precio:selectedServicio.precio,fecha:selectedFecha,hora:selectedHorario}]);
              addNotification("📅 ¡Cita reservada!",`${selectedServicio.nombre} el ${selectedFecha} a las ${selectedHorario}.`);
              setScreen("miscitas");
            }} style={{width:"100%",padding:"15px",fontSize:14,borderRadius:16,background:"linear-gradient(135deg,#25d366,#128c7e)",border:"none",color:"white",cursor:"pointer",fontWeight:700,boxShadow:"0 8px 24px rgba(37,211,102,0.25)"}}>
              💬 Confirmar por WhatsApp
            </button>
            <div style={{textAlign:"center",fontSize:10,color:"rgba(240,236,228,0.25)",marginTop:8}}>Se abrirá WhatsApp con tu reserva lista</div>
          </div>
        )}

        {/* ── GALERÍA ── */}
        {screen==="galeria" && (
          <div className="fade-in">
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:4}}>Nuestros trabajos 📷</div>
            <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:18}}>Últimos cortes de Horus Barber</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {GALERIA.map(g=>(
                <div key={g.id} style={{borderRadius:16,overflow:"hidden",position:"relative",cursor:"pointer"}}
                  onMouseOver={e=>e.currentTarget.style.transform="scale(1.02)"}
                  onMouseOut={e=>e.currentTarget.style.transform="scale(1)"} style={{transition:"transform 0.15s",borderRadius:16,overflow:"hidden",position:"relative"}}>
                  <img src={g.img} alt={g.titulo} style={{width:"100%",height:160,objectFit:"cover",display:"block"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)",padding:"20px 10px 8px"}}>
                    <div style={{fontSize:11,fontWeight:600}}>{g.titulo}</div>
                    <div style={{fontSize:10,color:"rgba(240,236,228,0.5)"}}>❤️ {g.likes}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>setScreen("reservar")} className="btn-gold" style={{width:"100%",padding:"13px",fontSize:14,borderRadius:14}}>
              ✂️ Reservar mi corte
            </button>
          </div>
        )}

        {/* ── CHAT IA ── */}
        {screen==="chat" && (
          <div className="fade-in" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)"}}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>Asistente HORUS ✨</div>
              <div style={{fontSize:10,color:"#c9a84c"}}>● En línea · Pregúntame lo que sea</div>
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,paddingBottom:10}}>
              {chatMessages.map((msg,i)=>(
                <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"83%",padding:"10px 14px",borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:msg.role==="user"?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.07)",border:msg.role==="assistant"?"1px solid rgba(255,255,255,0.06)":"none",color:msg.role==="user"?"#0a0a0a":"#f0ece4",fontSize:13,lineHeight:1.5}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && <div style={{display:"flex",gap:4,padding:"10px 14px",background:"rgba(255,255,255,0.07)",borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>
                {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#c9a84c",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
              </div>}
              <div ref={chatEndRef}/>
            </div>
            <div style={{display:"flex",gap:7,paddingTop:9,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Precios, horarios, estilos..." style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"11px 14px",color:"#f0ece4",fontSize:13,outline:"none"}}/>
              <button className="btn-gold" onClick={sendMessage} style={{padding:"11px 14px",borderRadius:12,fontSize:17}}>→</button>
            </div>
          </div>
        )}

        {/* ── MIS CITAS ── */}
        {screen==="miscitas" && (
          <div className="fade-in">
            <div style={{marginBottom:16}}>
              <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700}}>Mis Citas ✂️</div>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginTop:3}}>{bookings.length} cita{bookings.length!==1?"s":""}</div>
            </div>
            {bookings.length===0?(
              <div style={{textAlign:"center",padding:"50px 0"}}>
                <div style={{fontSize:44,marginBottom:12}}>📅</div>
                <div style={{color:"rgba(240,236,228,0.4)",marginBottom:18,fontSize:13}}>Aún no tienes citas</div>
                <button className="btn-gold" onClick={()=>setScreen("reservar")} style={{padding:"12px 24px",fontSize:13,borderRadius:12}}>Reservar ahora</button>
              </div>
            ):bookings.map((b,i)=>(
              <div key={i} className="glass" style={{borderRadius:16,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{b.servicio}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>📅 {b.fecha} · 🕐 {b.hora}</div>
                  </div>
                  <div style={{fontSize:17,fontWeight:700,color:"#c9a84c"}}>{b.precio}€</div>
                </div>
                <div style={{fontSize:10,color:"rgba(240,236,228,0.3)",marginBottom:9}}>📍 C/ Constitución 4, Alcobendas</div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>enviarWhatsApp(b.servicio,b.hora,b.fecha,user?.name||"Cliente")} style={{flex:1,padding:"9px",fontSize:11,borderRadius:10,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.25)",color:"#25d366",cursor:"pointer",fontWeight:600}}>💬 WhatsApp</button>
                  <button onClick={()=>enviarRecordatorio(b)} style={{flex:1,padding:"9px",fontSize:11,borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"rgba(240,236,228,0.6)",cursor:"pointer"}}>⏰ Recordatorio</button>
                </div>
              </div>
            ))}
            {bookings.length>0 && (
              <div style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:600,color:"rgba(240,236,228,0.5)",marginBottom:10}}>💬 Deja tu reseña</div>
                <div className="glass" style={{borderRadius:14,padding:14}}>
                  <div style={{display:"flex",gap:6,marginBottom:10}}>
                    {[1,2,3,4,5].map(n=>(
                      <button key={n} onClick={()=>setNuevaResena(r=>({...r,estrellas:n}))} style={{fontSize:22,background:"none",border:"none",cursor:"pointer",opacity:n<=nuevaResena.estrellas?1:0.3}}>⭐</button>
                    ))}
                  </div>
                  <textarea value={nuevaResena.texto} onChange={e=>setNuevaResena(r=>({...r,texto:e.target.value}))} placeholder="¿Cómo fue tu experiencia?" rows={3}
                    style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 12px",color:"#f0ece4",fontSize:13,outline:"none",resize:"none",marginBottom:8}}/>
                  <button className="btn-gold" onClick={()=>{
                    if (!nuevaResena.texto.trim()) return;
                    setResenas(p=>[{id:Date.now(),nombre:user?.name||"Cliente",estrellas:nuevaResena.estrellas,texto:nuevaResena.texto,fecha:"Ahora"},...p]);
                    setNuevaResena({estrellas:5,texto:""});
                    addNotification("⭐ ¡Gracias por tu reseña!","Tu opinión ayuda a otros clientes.");
                  }} style={{width:"100%",padding:"10px",fontSize:13,borderRadius:10}}>Publicar reseña</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESEÑAS ── */}
        {screen==="resenas" && (
          <div className="fade-in">
            <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:16}}>← Volver</button>
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:4}}>Reseñas ⭐</div>
            <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:16}}>{resenas.length} reseñas · {(resenas.reduce((a,r)=>a+r.estrellas,0)/resenas.length).toFixed(1)} promedio</div>
            {resenas.map(r=>(
              <div key={r.id} className="glass" style={{borderRadius:14,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <div style={{fontSize:12,fontWeight:600}}>{r.nombre}</div>
                  <div style={{fontSize:10,color:"rgba(240,236,228,0.3)"}}>{r.fecha}</div>
                </div>
                <div style={{fontSize:12,color:"#c9a84c",marginBottom:4}}>{"★".repeat(r.estrellas)}{"☆".repeat(5-r.estrellas)}</div>
                <div style={{fontSize:12,color:"rgba(240,236,228,0.6)",lineHeight:1.4}}>{r.texto}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── PERFIL ── */}
        {screen==="perfil" && user && (
          <div className="fade-in">
            <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:18}}>← Volver</button>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 10px",fontWeight:700,color:"#0a0a0a"}}>{user.name?.[0]?.toUpperCase()}</div>
              <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{user.name}</div>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginTop:3}}>{user.email}</div>
            </div>
            {[["📅","Mis citas",bookings.length,()=>setScreen("miscitas")],["⭐","Reseñas",resenas.length,()=>setScreen("resenas")],["🔔","Notificaciones",notifications.length,null]].map(([icon,label,count,action])=>(
              <div key={label} className="glass hover-scale" onClick={action} style={{borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:action?"pointer":"default"}}>
                <div style={{fontSize:13}}>{icon} {label}</div>
                <div style={{fontSize:12,color:"#c9a84c",fontWeight:600}}>{count}</div>
              </div>
            ))}

            {/* Lista de espera */}
            {listaEspera.length>0 && (
              <div className="glass" style={{borderRadius:14,padding:"14px 16px",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>⏳ Lista de espera</div>
                {listaEspera.map((e,i)=><div key={i} style={{fontSize:11,color:"rgba(240,236,228,0.5)",marginBottom:3}}>📅 {e.fecha} · {e.servicio}</div>)}
              </div>
            )}

            <div className="glass" style={{borderRadius:14,padding:"14px 16px",marginBottom:8}}>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.3)",marginBottom:6}}>Barbería</div>
              <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{INFO.barberia}</div>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:2}}>📍 {INFO.direccion}</div>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>📞 +{WHATSAPP_NUMBER}</div>
            </div>

            {/* Acceso admin */}
            <div className="glass" style={{borderRadius:14,padding:"14px 16px",marginBottom:8}}>
              <div style={{fontSize:11,color:"rgba(240,236,228,0.3)",marginBottom:8}}>🔐 Acceso administrador</div>
              <input type="password" placeholder="PIN admin" value={adminPin} onChange={e=>setAdminPin(e.target.value)} maxLength={4}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"9px 12px",color:"#f0ece4",fontSize:14,outline:"none",marginBottom:8,textAlign:"center",letterSpacing:6}}/>
              <button onClick={()=>{if(adminPin===ADMIN_PIN){setIsAdmin(true);setScreen("admin");setAdminPin("");}else{alert("PIN incorrecto");}}}
                style={{width:"100%",padding:"9px",borderRadius:10,background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)",color:"#c9a84c",cursor:"pointer",fontSize:12,fontWeight:600}}>
                Entrar como admin
              </button>
            </div>

            <button onClick={()=>{setAuthStep("splash");setUser(null);setIsAdmin(false);}} style={{width:"100%",marginTop:8,padding:"12px",borderRadius:14,background:"rgba(220,53,69,0.08)",border:"1px solid rgba(220,53,69,0.2)",color:"#ff6b7a",cursor:"pointer",fontSize:13}}>Cerrar sesión</button>
          </div>
        )}

        {/* ── PANEL ADMIN ── */}
        {screen==="admin" && isAdmin && (
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div>
                <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",fontWeight:700,color:"#c9a84c"}}>Panel Admin 🔐</div>
                <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>Horus Barber · Control total</div>
              </div>
              <button onClick={()=>setScreen("perfil")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",fontSize:13}}>← Salir</button>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
              {[["📅",bookings.length,"Citas"],["💰",bookings.reduce((a,b)=>a+b.precio,0)+"€","Ingresos"],["⭐",resenas.length,"Reseñas"]].map(([icon,val,label])=>(
                <div key={label} className="glass" style={{borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:20}}>{icon}</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#c9a84c"}}>{val}</div>
                  <div style={{fontSize:10,color:"rgba(240,236,228,0.4)"}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Bloquear días */}
            <div className="glass" style={{borderRadius:16,padding:14,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>⛔ Bloquear / Desbloquear días</div>
              <input type="date" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#f0ece4",fontSize:13,outline:"none",marginBottom:8,colorScheme:"dark"}}
                onChange={e=>{
                  const fecha = e.target.value;
                  if (!fecha) return;
                  if (diasBloqueados.includes(fecha)) {
                    setDiasBloqueados(p=>p.filter(d=>d!==fecha));
                    addNotification("✅ Día desbloqueado", `${fecha} está disponible de nuevo.`);
                  } else {
                    setDiasBloqueados(p=>[...p,fecha]);
                    addNotification("⛔ Día bloqueado", `${fecha} marcado como no disponible.`);
                  }
                }}/>
              {diasBloqueados.length>0 && (
                <div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:6}}>Días bloqueados:</div>
                  {diasBloqueados.map(d=>(
                    <div key={d} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"rgba(220,53,69,0.08)",border:"1px solid rgba(220,53,69,0.2)",borderRadius:8,marginBottom:4}}>
                      <span style={{fontSize:12,color:"#ff6b7a"}}>{d}</span>
                      <button onClick={()=>setDiasBloqueados(p=>p.filter(x=>x!==d))} style={{background:"none",border:"none",color:"#ff6b7a",cursor:"pointer",fontSize:12}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reservas del día */}
            <div className="glass" style={{borderRadius:16,padding:14,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>📋 Todas las reservas</div>
              {bookings.length===0?(
                <div style={{fontSize:12,color:"rgba(240,236,228,0.3)",textAlign:"center",padding:"10px 0"}}>Sin reservas aún</div>
              ):bookings.sort((a,b)=>a.fecha>b.fecha?1:-1).map((b,i)=>(
                <div key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:10,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{b.servicio}</div>
                      <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>📅 {b.fecha} · 🕐 {b.hora}</div>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:"#c9a84c"}}>{b.precio}€</div>
                  </div>
                  <button onClick={()=>enviarRecordatorio(b)} style={{marginTop:6,padding:"5px 10px",borderRadius:8,background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.2)",color:"#25d366",cursor:"pointer",fontSize:10}}>
                    ⏰ Enviar recordatorio
                  </button>
                </div>
              ))}
            </div>

            {/* Gestión de promos */}
            <div className="glass" style={{borderRadius:16,padding:14,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>🎉 Promociones</div>
              {promos.map(p=>(
                <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600}}>{p.titulo}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>{p.desc}</div>
                  </div>
                  <button onClick={()=>setPromos(prev=>prev.map(x=>x.id===p.id?{...x,activa:!x.activa}:x))}
                    style={{padding:"4px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:p.activa?"rgba(37,211,102,0.15)":"rgba(255,255,255,0.06)",color:p.activa?"#25d366":"rgba(240,236,228,0.4)"}}>
                    {p.activa?"Activa":"Inactiva"}
                  </button>
                </div>
              ))}
            </div>

            {/* Lista de espera admin */}
            <div className="glass" style={{borderRadius:16,padding:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>⏳ Lista de espera ({listaEspera.length})</div>
              {listaEspera.length===0?(
                <div style={{fontSize:12,color:"rgba(240,236,228,0.3)",textAlign:"center",padding:"8px 0"}}>Sin clientes en espera</div>
              ):listaEspera.map((e,i)=>(
                <div key={i} style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:4}}>👤 {e.nombre} · {e.servicio} · {e.fecha}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function HorusLogo({ size=48, style={} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <circle cx="50" cy="50" r="46" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/>
      <path d="M10 50 C25 22, 75 22, 90 50 C75 78, 25 78, 10 50 Z" stroke="#c9a84c" strokeWidth="2.5" fill="rgba(201,168,76,0.06)"/>
      <circle cx="50" cy="50" r="16" stroke="#c9a84c" strokeWidth="2.5" fill="rgba(201,168,76,0.1)"/>
      <circle cx="50" cy="50" r="7" fill="#c9a84c"/>
      <circle cx="53" cy="47" r="2.5" fill="rgba(255,255,255,0.6)"/>
      <path d="M34 50 L26 58 L30 58 L32 54" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M66 50 L74 58 L70 58 L68 54" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M30 38 L28 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M50 30 L50 24" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M70 38 L72 32" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function AuthInput({ label, type="text", placeholder, value, onChange }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:6}}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,padding:"12px 14px",color:"#f0ece4",fontSize:14,outline:"none"}}
        onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.5)"}
        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.09)"}/>
    </div>
  );
}

function ErrorBox({ msg }) {
  return <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:10,padding:"9px 12px",fontSize:12,color:"#ff6b7a",marginBottom:16}}>{msg}</div>;
}

function Spinner() {
  return <span style={{display:"inline-block",width:16,height:16,border:"2px solid rgba(0,0,0,0.2)",borderTop:"2px solid #0a0a0a",borderRadius:"50%",animation:"spin 0.6s linear infinite",verticalAlign:"middle"}}/>;
}

function Fonts() {
  return <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>;
}

function GlobalStyles() {
  return <style>{`
    * { box-sizing:border-box; margin:0; padding:0; }
    ::-webkit-scrollbar { width:0; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spin { to { transform:rotate(360deg); } }
    .fade-in { animation:fadeIn 0.3s ease forwards; }
    .btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0a0a; font-weight:600; border:none; border-radius:14px; cursor:pointer; transition:transform 0.15s,opacity 0.15s; }
    .btn-gold:hover { transform:scale(1.02); opacity:0.95; }
    .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(20px); }
    .hover-scale { transition:transform 0.15s; }
    .hover-scale:hover { transform:scale(1.01); }
  `}</style>;
}
