import { useState, useRef, useEffect } from "react";

const WHATSAPP_NUMBER = "34603768132";

const SERVICIOS = [
  { id:1, nombre:"Corte", precio:13, duracion:"30 min", emoji:"✂️", color:"#c9a84c" },
  { id:2, nombre:"Corte + Cejas", precio:15, duracion:"40 min", emoji:"✂️", color:"#e07b54" },
  { id:3, nombre:"Corte + Barba", precio:17, duracion:"50 min", emoji:"🧔", color:"#7b9e87" },
  { id:4, nombre:"Corte Premium", precio:20, duracion:"60 min", emoji:"👑", color:"#5b8dd9" },
];

const HORARIOS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00",
  "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00"
];

const INFO = {
  nombre: "Horus Barber",
  barberia: "Barbería de Horus",
  direccion: "Calle Constitución 4, Alcobendas",
  horario: "Lun - Sáb · 10:00 - 21:30",
  descanso: "Descanso 14:30 - 16:30",
  whatsapp: WHATSAPP_NUMBER,
};

const CHAT_SYSTEM = `Eres el asistente IA de Horus Barber, una barbería premium en Alcobendas, España.
La barbería se llama "Barbería de Horus", está en Calle Constitución 4, Alcobendas.
Horario: Lunes a Sábado de 10:00 a 21:30 con descanso de 14:30 a 16:30.
Servicios: Corte 13€, Corte+Cejas 15€, Corte+Barba 17€, Corte Premium 20€.
WhatsApp para reservas: +34 603 768 132.
Responde siempre en español, de forma amigable y profesional. Sé conciso pero útil.
Ayuda con: reservas, precios, horarios, consejos de estilo y cuidado capilar.`;

export default function HorusApp() {
  const [authStep, setAuthStep] = useState("splash");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", code:"" });
  const [formError, setFormError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [screen, setScreen] = useState("home");
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [selectedFecha, setSelectedFecha] = useState("");
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([
    { id:1, title:"¡Bienvenido a Horus Barber! 🎉", body:"Tu cuenta está lista. Reserva tu cita ahora.", time:"ahora", read:false },
    { id:2, title:"Oferta especial 👁️", body:"Corte Premium esta semana con descuento especial.", time:"5 min", read:false },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role:"assistant", content:"¡Hola! 👋 Soy el asistente de Horus Barber. ¿Quieres reservar una cita, consultar precios o necesitas consejos de estilo?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addNotification = (title, body) => {
    setNotifications(prev => [{ id: Date.now(), title, body, time: "ahora", read: false }, ...prev]);
  };

  const enviarWhatsApp = (servicio, horario, fecha, nombre) => {
    const msg = `¡Hola! Quiero reservar una cita 💈%0A%0A👤 *Nombre:* ${nombre}%0A✂️ *Servicio:* ${servicio}%0A📅 *Fecha:* ${fecha}%0A🕐 *Hora:* ${horario}%0A%0A¡Gracias!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  const handleLogin = async () => {
    setFormError("");
    if (!form.email || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Contraseña muy corta."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUser({ name: form.email.split("@")[0], email: form.email });
    setAuthLoading(false);
    setAuthStep("app");
  };

  const handleRegister = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Mínimo 6 caracteres."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setAuthLoading(false);
    setAuthStep("verify");
  };

  const handleVerify = async () => {
    setFormError("");
    if (form.code.length !== 6) { setFormError("El código tiene 6 dígitos."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setUser({ name: form.name, email: form.email });
    setAuthLoading(false);
    setAuthStep("app");
    addNotification("✅ ¡Bienvenido!", `Hola ${form.name}, tu cuenta en Horus Barber está lista.`);
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
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000, system: CHAT_SYSTEM,
          messages:[...chatMessages.map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role:"assistant", content: data.content?.[0]?.text || "Error." }]);
    } catch { setChatMessages(prev => [...prev, { role:"assistant", content:"Error de conexión." }]); }
    setIsTyping(false);
  };

  const base = { fontFamily:"'DM Sans', sans-serif", background:"#0a0a0a", minHeight:"100vh", color:"#f0ece4", display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden" };

  // ── SPLASH ──
  if (authStep === "splash") return (
    <div style={{...base, justifyContent:"center", alignItems:"center", minHeight:"100vh"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(224,123,84,0.1) 0%, transparent 50%)"}}/>
      <div style={{textAlign:"center",zIndex:1,padding:40}}>
        <HorusLogo size={96} style={{margin:"0 auto 20px"}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:900,color:"#c9a84c",letterSpacing:"-2px",lineHeight:1}}>HORUS</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:"rgba(240,236,228,0.6)",marginTop:4,marginBottom:8}}>Barber</div>
        <div style={{fontSize:11,letterSpacing:"4px",color:"rgba(240,236,228,0.3)",marginBottom:16}}>ALCOBENDAS · MADRID</div>
        <div style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:12,padding:"10px 16px",marginBottom:40,fontSize:13,color:"rgba(240,236,228,0.6)"}}>
          📍 Calle Constitución 4 · Lun-Sáb 10:00-21:30
        </div>
        <button className="btn-gold" onClick={()=>setAuthStep("register")} style={{width:"100%",padding:"16px",fontSize:16,borderRadius:18,marginBottom:14}}>Reservar mi cita</button>
        <button onClick={()=>setAuthStep("login")} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"#f0ece4",cursor:"pointer"}}>Ya tengo cuenta</button>
        <div style={{marginTop:24,fontSize:12,color:"rgba(240,236,228,0.3)"}}>O escríbenos directamente</div>
        <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{marginTop:10,width:"100%",padding:"13px",fontSize:14,borderRadius:16,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",cursor:"pointer",fontWeight:600}}>
          💬 WhatsApp
        </button>
      </div>
    </div>
  );

  // ── LOGIN ──
  if (authStep === "login") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)"}}/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <HorusLogo size={48} style={{marginBottom:16}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Bienvenido 👋</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,marginBottom:36}}>Inicia sesión para gestionar tus citas</div>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleLogin} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,marginBottom:16,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Iniciar sesión"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿No tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("register")}>Regístrate</span></div>
      </div>
    </div>
  );

  // ── REGISTER ──
  if (authStep === "register") return (
    <div style={{...base, padding:"40px 28px", overflowY:"auto"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)"}}/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Crear cuenta 👁️</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,marginBottom:36}}>Para gestionar tus citas en Horus Barber</div>
        <AuthInput label="Nombre completo" placeholder="Tu nombre" value={form.name} onChange={v=>setForm({...form,name:v})}/>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Teléfono" type="tel" placeholder="+34 600 000 000" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        <div style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:14,padding:"12px 16px",fontSize:12,color:"rgba(240,236,228,0.6)",marginBottom:20,lineHeight:1.5}}>
          🔔 Recibirás recordatorios de tus citas por notificación.
        </div>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleRegister} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,marginBottom:16,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Crear cuenta →"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿Ya tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("login")}>Inicia sesión</span></div>
      </div>
    </div>
  );

  // ── VERIFY ──
  if (authStep === "verify") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("register")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <div style={{fontSize:56,textAlign:"center",marginBottom:16}}>📱</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:"#c9a84c",textAlign:"center",marginBottom:8}}>Verificación SMS</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,textAlign:"center",marginBottom:36,lineHeight:1.5}}>Código enviado a<br/><strong style={{color:"#f0ece4"}}>{form.phone}</strong></div>
        <input type="text" maxLength={6} placeholder="000000" value={form.code} onChange={e=>setForm({...form,code:e.target.value.replace(/\D/g,"")})}
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:"18px",color:"#c9a84c",fontSize:32,textAlign:"center",letterSpacing:12,outline:"none",marginBottom:16,fontFamily:"'Playfair Display',serif",fontWeight:700}}/>
        <div style={{background:"rgba(91,141,217,0.1)",border:"1px solid rgba(91,141,217,0.2)",borderRadius:12,padding:"10px 14px",fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:20,textAlign:"center"}}>
          💡 Demo: usa el código <strong style={{color:"#5b8dd9"}}>123456</strong>
        </div>
        {formError && <ErrorBox msg={formError}/>}
        <button className="btn-gold" onClick={handleVerify} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Verificar y entrar ✓"}</button>
      </div>
    </div>
  );

  // ── MAIN APP ──
  return (
    <div style={base}>
      <Fonts/><GlobalStyles/>

      {/* Header */}
      <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"rgba(10,10,10,0.95)",backdropFilter:"blur(20px)",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <HorusLogo size={34}/>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,letterSpacing:"-1px",color:"#c9a84c",lineHeight:1}}>HORUS</div>
            <div style={{fontSize:9,color:"rgba(240,236,228,0.3)",letterSpacing:"1px"}}>BARBER · ALCOBENDAS</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div ref={notifRef} style={{position:"relative"}}>
            <button onClick={()=>{setShowNotifs(!showNotifs); setNotifications(prev=>prev.map(n=>({...n,read:true})));}}
              style={{width:38,height:38,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>
              🔔
              {unread > 0 && <span style={{position:"absolute",top:-4,right:-4,background:"#e07b54",color:"white",borderRadius:"50%",width:17,height:17,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{position:"absolute",right:0,top:46,width:290,background:"#141414",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",zIndex:100,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:13,fontWeight:600}}>Notificaciones</div>
                {notifications.map(n => (
                  <div key={n.id} style={{padding:"11px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{n.title}</div>
                    <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",lineHeight:1.4}}>{n.body}</div>
                    <div style={{fontSize:10,color:"rgba(240,236,228,0.3)",marginTop:3}}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div onClick={()=>setScreen("perfil")} style={{width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",fontWeight:700,color:"#0a0a0a"}}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",padding:"8px 14px",gap:5,background:"rgba(10,10,10,0.9)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        {[["home","🏠","Inicio"],["reservar","📅","Reservar"],["chat","💬","IA"],["miscitas","✂️","Mis Citas"]].map(([tab,icon,label])=>(
          <button key={tab} onClick={()=>setScreen(tab)} style={{flex:1,padding:"8px 4px",borderRadius:12,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:screen===tab?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.04)",color:screen===tab?"#0a0a0a":"rgba(240,236,228,0.4)",transition:"all 0.2s"}}>{icon} {label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 80px"}}>

        {/* ── HOME ── */}
        {screen==="home" && (
          <div className="fade-in">
            <div style={{marginBottom:20}}>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:3}}>
                Buenas, {user?.name?.split(" ")[0] || "crack"} 👋
              </div>
              <div style={{color:"rgba(240,236,228,0.4)",fontSize:13}}>Bienvenido a Horus Barber</div>
            </div>

            {/* Info card */}
            <div className="glass" style={{borderRadius:20,padding:18,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#c9a84c",marginBottom:4}}>Barbería de Horus</div>
                  <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:4}}>📍 {INFO.direccion}</div>
                  <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:2}}>🕐 {INFO.horario}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)"}}>☕ {INFO.descanso}</div>
                </div>
                <div style={{background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",borderRadius:10,padding:"4px 10px",fontSize:11,color:"#25d366",fontWeight:600}}>Abierto</div>
              </div>
              <button className="btn-gold" onClick={()=>setScreen("reservar")} style={{width:"100%",padding:"13px",fontSize:14,borderRadius:14}}>
                📅 Reservar cita ahora
              </button>
            </div>

            {/* Servicios */}
            <div style={{fontSize:14,fontWeight:600,color:"rgba(240,236,228,0.7)",marginBottom:12}}>✂️ Nuestros servicios</div>
            {SERVICIOS.map(s=>(
              <div key={s.id} className="glass hover-scale" onClick={()=>{setSelectedServicio(s);setScreen("reservar");}} style={{borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:24}}>{s.emoji}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>{s.nombre}</div>
                    <div style={{fontSize:12,color:"rgba(240,236,228,0.4)"}}>{s.duracion}</div>
                  </div>
                </div>
                <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.precio}€</div>
              </div>
            ))}

            {/* WhatsApp directo */}
            <button onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`,"_blank")} style={{width:"100%",marginTop:8,padding:"14px",fontSize:14,borderRadius:16,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",cursor:"pointer",fontWeight:600}}>
              💬 Contactar por WhatsApp
            </button>
          </div>
        )}

        {/* ── RESERVAR ── */}
        {screen==="reservar" && (
          <div className="fade-in">
            <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:4}}>Reservar cita 📅</div>
            <div style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginBottom:20}}>Barbería de Horus · Alcobendas</div>

            {/* Paso 1: Servicio */}
            <div style={{fontSize:13,fontWeight:600,color:"#c9a84c",marginBottom:10}}>1️⃣ Elige tu servicio</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
              {SERVICIOS.map(s=>(
                <div key={s.id} onClick={()=>setSelectedServicio(s)} style={{borderRadius:16,padding:"14px 12px",cursor:"pointer",border:`2px solid ${selectedServicio?.id===s.id ? s.color : "rgba(255,255,255,0.08)"}`,background:selectedServicio?.id===s.id ? `rgba(${s.color},0.1)` : "rgba(255,255,255,0.03)",transition:"all 0.2s",textAlign:"center"}}>
                  <div style={{fontSize:26,marginBottom:6}}>{s.emoji}</div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{s.nombre}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:6}}>{s.duracion}</div>
                  <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.precio}€</div>
                </div>
              ))}
            </div>

            {/* Paso 2: Fecha */}
            <div style={{fontSize:13,fontWeight:600,color:"#c9a84c",marginBottom:10}}>2️⃣ Elige la fecha</div>
            <input type="date" value={selectedFecha} onChange={e=>setSelectedFecha(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"13px 16px",color:"#f0ece4",fontSize:14,outline:"none",marginBottom:24,colorScheme:"dark"}}/>

            {/* Paso 3: Horario */}
            <div style={{fontSize:13,fontWeight:600,color:"#c9a84c",marginBottom:10}}>3️⃣ Elige el horario</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:24}}>
              {HORARIOS.map(h=>(
                <button key={h} onClick={()=>setSelectedHorario(h)} style={{padding:"10px 4px",borderRadius:12,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:selectedHorario===h?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.06)",color:selectedHorario===h?"#0a0a0a":"#f0ece4",transition:"all 0.2s"}}>{h}</button>
              ))}
            </div>

            {/* Resumen */}
            {selectedServicio && (
              <div className="glass" style={{borderRadius:18,padding:18,marginBottom:20}}>
                <div style={{fontSize:13,color:"rgba(240,236,228,0.5)",marginBottom:12,fontWeight:600}}>Resumen de tu cita</div>
                {[
                  ["Servicio", selectedServicio.nombre, selectedServicio.color],
                  ["Precio", `${selectedServicio.precio}€`, "#c9a84c"],
                  ["Fecha", selectedFecha || "Sin seleccionar", null],
                  ["Hora", selectedHorario || "Sin seleccionar", null],
                  ["Barbería", "Barbería de Horus", null],
                  ["Dirección", "C/ Constitución 4, Alcobendas", null],
                ].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{fontSize:12,color:"rgba(240,236,228,0.4)"}}>{k}</span>
                    <span style={{fontSize:12,color:c||"#f0ece4",fontWeight:c?600:400}}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botón WhatsApp */}
            <button onClick={()=>{
              if (!selectedServicio) { alert("Elige un servicio primero."); return; }
              if (!selectedFecha) { alert("Elige una fecha."); return; }
              if (!selectedHorario) { alert("Elige un horario."); return; }
              const nombre = user?.name || "Cliente";
              enviarWhatsApp(selectedServicio.nombre, selectedHorario, selectedFecha, nombre);
              setBookings(prev=>[...prev,{servicio:selectedServicio.nombre,precio:selectedServicio.precio,fecha:selectedFecha,hora:selectedHorario}]);
              addNotification("📅 Cita solicitada", `${selectedServicio.nombre} el ${selectedFecha} a las ${selectedHorario}. Te confirmamos por WhatsApp.`);
            }} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,background:"linear-gradient(135deg,#25d366,#128c7e)",border:"none",color:"white",cursor:"pointer",fontWeight:700,boxShadow:"0 8px 24px rgba(37,211,102,0.3)"}}>
              💬 Confirmar por WhatsApp
            </button>
            <div style={{textAlign:"center",fontSize:11,color:"rgba(240,236,228,0.3)",marginTop:10}}>
              Se abrirá WhatsApp con tu reserva lista para enviar
            </div>
          </div>
        )}

        {/* ── CHAT IA ── */}
        {screen==="chat" && (
          <div className="fade-in" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 220px)"}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>Asistente HORUS ✨</div>
              <div style={{fontSize:11,color:"#c9a84c"}}>● En línea · Pregúntame lo que sea</div>
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:12}}>
              {chatMessages.map((msg,i)=>(
                <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.role==="user"?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.07)",border:msg.role==="assistant"?"1px solid rgba(255,255,255,0.07)":"none",color:msg.role==="user"?"#0a0a0a":"#f0ece4",fontSize:14,lineHeight:1.5}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{display:"flex",gap:5,padding:"12px 16px",background:"rgba(255,255,255,0.07)",borderRadius:"18px 18px 18px 4px",width:"fit-content"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#c9a84c",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div style={{display:"flex",gap:8,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Precios, horarios, estilos..." style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 15px",color:"#f0ece4",fontSize:14,outline:"none"}}/>
              <button className="btn-gold" onClick={sendMessage} style={{padding:"12px 16px",borderRadius:14,fontSize:18}}>→</button>
            </div>
          </div>
        )}

        {/* ── MIS CITAS ── */}
        {screen==="miscitas" && (
          <div className="fade-in">
            <div style={{marginBottom:18}}>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700}}>Mis Citas ✂️</div>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginTop:4}}>{bookings.length} cita{bookings.length!==1?"s":""} registrada{bookings.length!==1?"s":""}</div>
            </div>
            {bookings.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:48,marginBottom:14}}>📅</div>
                <div style={{color:"rgba(240,236,228,0.4)",marginBottom:20,fontSize:14}}>Aún no tienes citas.<br/>¡Reserva tu primera cita!</div>
                <button className="btn-gold" onClick={()=>setScreen("reservar")} style={{padding:"13px 28px",fontSize:14,borderRadius:14}}>Reservar ahora</button>
              </div>
            ) : bookings.map((b,i)=>(
              <div key={i} className="glass" style={{borderRadius:18,padding:16,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:15,marginBottom:3}}>{b.servicio}</div>
                    <div style={{fontSize:12,color:"rgba(240,236,228,0.5)"}}>📅 {b.fecha} · 🕐 {b.hora}</div>
                  </div>
                  <div style={{fontSize:18,fontWeight:700,color:"#c9a84c"}}>{b.precio}€</div>
                </div>
                <div style={{fontSize:11,color:"rgba(240,236,228,0.3)",marginBottom:10}}>📍 Barbería de Horus · C/ Constitución 4, Alcobendas</div>
                <button onClick={()=>enviarWhatsApp(b.servicio, b.hora, b.fecha, user?.name||"Cliente")} style={{width:"100%",padding:"10px",fontSize:13,borderRadius:12,background:"rgba(37,211,102,0.1)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",cursor:"pointer",fontWeight:600}}>
                  💬 Contactar por WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── PERFIL ── */}
        {screen==="perfil" && user && (
          <div className="fade-in">
            <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:20}}>← Volver</button>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 12px",fontWeight:700,color:"#0a0a0a"}}>{user.name?.[0]?.toUpperCase()}</div>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{user.name}</div>
              <div style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginTop:4}}>{user.email}</div>
            </div>
            {[["📅","Mis citas",bookings.length],["🔔","Notificaciones",notifications.length]].map(([icon,label,count])=>(
              <div key={label} className="glass hover-scale" style={{borderRadius:16,padding:"16px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <div style={{fontSize:14}}>{icon} {label}</div>
                <div style={{fontSize:13,color:"#c9a84c",fontWeight:600}}>{count}</div>
              </div>
            ))}
            <div className="glass" style={{borderRadius:16,padding:"16px 18px",marginBottom:10}}>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:8}}>Barbería</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Barbería de Horus</div>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:2}}>📍 {INFO.direccion}</div>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.5)"}}>📞 +{INFO.whatsapp}</div>
            </div>
            <button onClick={()=>{setAuthStep("splash");setUser(null);}} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:16,background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.2)",color:"#ff6b7a",cursor:"pointer",fontSize:14}}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </div>
  );
}

function HorusLogo({ size = 48, style = {} }) {
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
    <div style={{marginBottom:18}}>
      <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:7}}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"13px 16px",color:"#f0ece4",fontSize:14,outline:"none"}}
        onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.5)"}
        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
    </div>
  );
}

function ErrorBox({ msg }) {
  return <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#ff6b7a",marginBottom:20}}>{msg}</div>;
}

function Spinner() {
  return <span style={{display:"inline-block",width:18,height:18,border:"2px solid rgba(0,0,0,0.2)",borderTop:"2px solid #0a0a0a",borderRadius:"50%",animation:"spin 0.6s linear infinite",verticalAlign:"middle"}}/>;
}

function Fonts() {
  return <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>;
}

function GlobalStyles() {
  return <style>{`
    * { box-sizing:border-box; margin:0; padding:0; }
    ::-webkit-scrollbar { width:0; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spin { to { transform:rotate(360deg); } }
    .fade-in { animation:fadeIn 0.35s ease forwards; }
    .tag { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:4px 11px; font-size:11px; }
    .btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0a0a; font-weight:600; border:none; border-radius:14px; cursor:pointer; transition:transform 0.15s,opacity 0.15s; }
    .btn-gold:hover { transform:scale(1.02); opacity:0.95; }
    .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(20px); }
    .hover-scale { transition:transform 0.15s; }
    .hover-scale:hover { transform:scale(1.01); }
  `}</style>;
}
