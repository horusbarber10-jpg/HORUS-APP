import { useState, useRef, useEffect } from "react";

const BARBERS = [
  { id:1, name:'Carlos "El Maestro" Ruiz', specialty:"Fade Clásico & Barba", rating:4.9, reviews:312, price:25, distance:"0.3 km", tags:["Fade","Barba","Diseños"], available:"Hoy · 3:00 PM", img:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=500&fit=crop&crop=face", bio:"12 años transformando looks. Especialista en fades y diseños personalizados.", color:"#c9a84c" },
  { id:2, name:"Diego Montoya", specialty:"Cortes Modernos & Textura", rating:4.8, reviews:198, price:30, distance:"0.7 km", tags:["Textura","Moderno","Afro"], available:"Hoy · 5:30 PM", img:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=500&fit=crop&crop=face", bio:"Especialista en cabello afro y texturizado. Cada corte es una obra de arte.", color:"#e07b54" },
  { id:3, name:'Andrés "Blade" Torres', specialty:"Navajas & Barba Premium", rating:5.0, reviews:87, price:45, distance:"1.2 km", tags:["Navaja","Barba","Premium"], available:"Mañana · 10:00 AM", img:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face", bio:"El arte de la navaja. Experiencia de lujo en cada visita.", color:"#7b9e87" },
  { id:4, name:"Miguel Ángel Reyes", specialty:"Kids & Familia", rating:4.7, reviews:445, price:20, distance:"0.5 km", tags:["Niños","Familia","Clásico"], available:"Hoy · 4:00 PM", img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face", bio:"El favorito de las familias. Paciencia, precisión y buen humor garantizado.", color:"#5b8dd9" }
];

const CHAT_SYSTEM = `Eres el asistente IA de HORUS, una app premium de reservas de barbería y cuidado personal. 
Ayuda a los usuarios a: encontrar barberos, recomendar estilos, agendar citas, dar consejos de cuidado capilar y de barba.
Responde siempre en español, de forma amigable y profesional. Sé conciso pero útil.
Si te preguntan por barberos disponibles, menciona a Carlos, Diego, Andrés o Miguel de nuestra app.`;

export default function BarbrApp() {
  const [authStep, setAuthStep] = useState("splash");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", code:"" });
  const [formError, setFormError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [screen, setScreen] = useState("home");
  const [filter, setFilter] = useState("Todos");
  const [liked, setLiked] = useState([]);
  const [passed, setPassed] = useState([]);
  const [swipeDir, setSwipeDir] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [bookedTime, setBookedTime] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([
    { id:1, title:"¡Bienvenido a HORUS! 🎉", body:"Tu cuenta está lista. Encuentra tu barbero ideal.", time:"ahora", read:false },
    { id:2, title:"Oferta especial 👁️", body:"Carlos tiene disponibilidad esta tarde. ¡Reserva ya!", time:"5 min", read:false },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role:"assistant", content:"¡Hola! 👋 Soy tu asistente HORUS. ¿Buscas barbero, quieres agendar o necesitas consejos de estilo?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const notifRef = useRef(null);
  const filters = ["Todos","Fade","Barba","Moderno","Premium"];
  const unread = notifications.filter(n => !n.read).length;
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [chatMessages]);
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const handleLogin = async () => {
    setFormError("");
    if (!form.email || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.password.length < 6) { setFormError("Contraseña muy corta."); return; }
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUser({ name: form.email.split("@")[0], email: form.email, avatar: "👤" });
    setAuthLoading(false);
    setAuthStep("app");
  };
  const handleRegister = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setFormError("Completa todos los campos."); return; }
    if (!form.email.includes("@")) { setFormError("Email inválido."); return; }
    if (form.phone.replace(/\D/g,"").length < 8) { setFormError("Teléfono inválido."); return; }
    if (form.password.length < 6) { setFormError("Mínimo 6 caracteres en contraseña."); return; }
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
    setUser({ name: form.name, email: form.email, avatar: "👤" });
    setAuthLoading(false);
    setAuthStep("app");
    addNotification("✅ Verificación exitosa", "Tu cuenta HORUS ha sido verificada. ¡Bienvenido!");
  };
  const addNotification = (title, body) => {
    setNotifications(prev => [{ id: Date.now(), title, body, time: "ahora", read: false }, ...prev]);
  };
  const currentCard = (() => {
    const visible = BARBERS.filter(b => !passed.includes(b.id) && !liked.includes(b.id));
    const filtered = filter === "Todos" ? visible : visible.filter(b => b.tags.includes(filter));
    return filtered[0] || null;
  })();
  const handleSwipe = (dir) => {
    if (!currentCard) return;
    setSwipeDir(dir);
    setTimeout(() => {
      if (dir === "right") {
        setLiked(prev => [...prev, currentCard.id]);
        addNotification("👁️ ¡Guardado!", `${currentCard.name} fue añadido a tus favoritos.`);
      } else {
        setPassed(prev => [...prev, currentCard.id]);
      }
      setSwipeDir(null);
    }, 400);
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
  const likedBarbers = BARBERS.filter(b => liked.includes(b.id));
  const base = {
    fontFamily:"'DM Sans', sans-serif", background:"#0a0a0a", minHeight:"100vh",
    color:"#f0ece4", display:"flex", flexDirection:"column",
    maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden"
  };
  if (authStep === "splash") return (
    <div style={{...base, justifyContent:"center", alignItems:"center", minHeight:"100vh"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 20%, rgba(201,168,76,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(224,123,84,0.1) 0%, transparent 50%)"}}/>
      <div style={{textAlign:"center",zIndex:1,padding:40}}>
        <HorusLogo size={88} style={{margin:"0 auto 16px"}}/>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:56,fontWeight:900,color:"#c9a84c",letterSpacing:"-2px",lineHeight:1}}>HORUS</div>
        <div style={{fontSize:13,letterSpacing:"4px",color:"rgba(240,236,228,0.4)",marginTop:8,marginBottom:48}}>CUIDADO PREMIUM</div>
        <p style={{fontSize:16,color:"rgba(240,236,228,0.6)",marginBottom:40,maxWidth:280,margin:"0 auto 40px",lineHeight:1.6}}>Encuentra tu barbero ideal. Reserva en segundos.</p>
        <button className="btn-gold" onClick={()=>setAuthStep("register")} style={{width:"100%",padding:"16px",fontSize:16,borderRadius:18,marginBottom:14}}>Crear cuenta gratis</button>
        <button onClick={()=>setAuthStep("login")} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"#f0ece4",cursor:"pointer"}}>Ya tengo cuenta</button>
      </div>
    </div>
  );
  if (authStep === "login") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)"}}/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Bienvenido 👋</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,marginBottom:36}}>Inicia sesión para continuar</div>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="••••••••" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        {formError && <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#ff6b7a",marginBottom:20}}>{formError}</div>}
        <button className="btn-gold" onClick={handleLogin} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,marginBottom:16,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Iniciar sesión"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿No tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("register")}>Regístrate</span></div>
        <SocialAuth/>
      </div>
    </div>
  );
  if (authStep === "register") return (
    <div style={{...base, padding:"40px 28px", overflowY:"auto"}}>
      <Fonts/><GlobalStyles/>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 60%)"}}/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("splash")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:900,color:"#c9a84c",marginBottom:4}}>Crear cuenta 👁️</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,marginBottom:36}}>Únete a miles de usuarios HORUS</div>
        <AuthInput label="Nombre completo" placeholder="Juan García" value={form.name} onChange={v=>setForm({...form,name:v})}/>
        <AuthInput label="Email" type="email" placeholder="tu@email.com" value={form.email} onChange={v=>setForm({...form,email:v})}/>
        <AuthInput label="Teléfono" type="tel" placeholder="+52 555 123 4567" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
        <AuthInput label="Contraseña" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={v=>setForm({...form,password:v})}/>
        <div style={{background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:14,padding:"12px 16px",fontSize:12,color:"rgba(240,236,228,0.6)",marginBottom:20,lineHeight:1.5}}>🔔 Al registrarte aceptas recibir <strong style={{color:"#c9a84c"}}>notificaciones push</strong> sobre tus citas, ofertas y recordatorios.</div>
        {formError && <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#ff6b7a",marginBottom:20}}>{formError}</div>}
        <button className="btn-gold" onClick={handleRegister} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,marginBottom:16,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Crear cuenta →"}</button>
        <div style={{textAlign:"center",fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿Ya tienes cuenta? <span style={{color:"#c9a84c",cursor:"pointer"}} onClick={()=>setAuthStep("login")}>Inicia sesión</span></div>
        <SocialAuth/>
      </div>
    </div>
  );
  if (authStep === "verify") return (
    <div style={{...base, justifyContent:"center", padding:"40px 28px"}}>
      <Fonts/><GlobalStyles/>
      <div style={{zIndex:1}}>
        <button onClick={()=>setAuthStep("register")} style={{background:"none",border:"none",color:"rgba(240,236,228,0.4)",cursor:"pointer",marginBottom:32,fontSize:14}}>← Volver</button>
        <div style={{fontSize:56,textAlign:"center",marginBottom:16}}>📱</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#c9a84c",textAlign:"center",marginBottom:8}}>Verificación SMS</div>
        <div style={{color:"rgba(240,236,228,0.5)",fontSize:14,textAlign:"center",marginBottom:36,lineHeight:1.5}}>Enviamos un código de 6 dígitos a<br/><strong style={{color:"#f0ece4"}}>{form.phone || "+52 555 *** ****"}</strong></div>
        <div style={{marginBottom:8,fontSize:13,color:"rgba(240,236,228,0.5)"}}>Código de verificación</div>
        <input type="text" maxLength={6} placeholder="000000" value={form.code} onChange={e=>setForm({...form,code:e.target.value.replace(/\D/g,"")})}
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:"18px",color:"#c9a84c",fontSize:32,textAlign:"center",letterSpacing:12,outline:"none",marginBottom:24,fontFamily:"'Playfair Display',serif",fontWeight:700}}/>
        <div style={{background:"rgba(91,141,217,0.1)",border:"1px solid rgba(91,141,217,0.2)",borderRadius:12,padding:"10px 14px",fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:20,textAlign:"center"}}>💡 Para esta demo, usa el código: <strong style={{color:"#5b8dd9"}}>123456</strong></div>
        {formError && <div style={{background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.3)",borderRadius:12,padding:"10px 14px",fontSize:13,color:"#ff6b7a",marginBottom:20}}>{formError}</div>}
        <button className="btn-gold" onClick={handleVerify} disabled={authLoading} style={{width:"100%",padding:"16px",fontSize:15,borderRadius:18,opacity:authLoading?0.7:1}}>{authLoading ? <Spinner/> : "Verificar y entrar ✓"}</button>
        <div style={{textAlign:"center",marginTop:20,fontSize:13,color:"rgba(240,236,228,0.4)"}}>¿No llegó? <span style={{color:"#c9a84c",cursor:"pointer"}}>Reenviar código</span></div>
      </div>
    </div>
  );
  return (
    <div style={base}>
      <Fonts/><GlobalStyles/>
      <div style={{padding:"20px 24px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"rgba(10,10,10,0.95)",backdropFilter:"blur(20px)",zIndex:10,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <HorusLogo size={36}/>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,letterSpacing:"-1px",color:"#c9a84c",lineHeight:1}}>HORUS</div>
            <div style={{fontSize:9,color:"rgba(240,236,228,0.3)",letterSpacing:"2px"}}>CUIDADO PREMIUM</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div ref={notifRef} style={{position:"relative"}}>
            <button onClick={()=>{setShowNotifs(!showNotifs); setNotifications(prev=>prev.map(n=>({...n,read:true})));}}
              style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
              🔔
              {unread > 0 && <span style={{position:"absolute",top:-4,right:-4,background:"#e07b54",color:"white",borderRadius:"50%",width:18,height:18,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}
            </button>
            {showNotifs && (
              <div style={{position:"absolute",right:0,top:48,width:300,background:"#141414",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",zIndex:100,overflow:"hidden",animation:"fadeIn 0.2s ease"}}>
                <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",fontSize:13,fontWeight:600}}>Notificaciones</div>
                {notifications.map(n => (
                  <div key={n.id} style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{n.title}</div>
                    <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",lineHeight:1.4}}>{n.body}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.3)",marginTop:4}}>{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div onClick={()=>setScreen("profile-user")} style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",fontWeight:700,color:"#0a0a0a"}}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
      <div style={{display:"flex",padding:"10px 16px",gap:6,background:"rgba(10,10,10,0.9)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        {[["home","🏠","Inicio"],["discover","👁️","Swipe"],["chat","💬","IA"],["matches","❤️","Guardados"]].map(([tab,icon,label])=>(
          <button key={tab} onClick={()=>setScreen(tab)} style={{flex:1,padding:"8px 4px",borderRadius:12,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:screen===tab?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.04)",color:screen===tab?"#0a0a0a":"rgba(240,236,228,0.4)",transition:"all 0.2s"}}>{icon} {label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 80px"}}>
        {screen==="home" && (
          <div className="fade-in">
            <div style={{marginBottom:24}}>
              <div style={{fontSize:22,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:4}}>Buenas, {user?.name?.split(" ")[0] || "crack"} 👋</div>
              <div style={{color:"rgba(240,236,228,0.4)",fontSize:13}}>¿Qué necesitas hoy?</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
              {[["✂️","Corte","#c9a84c"],["🧔","Barba","#e07b54"],["💆","Facial","#7b9e87"],["👁️","Ahora","#5b8dd9"]].map(([icon,label,color])=>(
                <div key={label} className="glass hover-scale" onClick={()=>setScreen("discover")} style={{borderRadius:16,padding:"18px 16px",cursor:"pointer"}}>
                  <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                  <div style={{fontSize:13,fontWeight:500,color}}>{label}</div>
                </div>
              ))}
            </div>
            {bookings.length > 0 && (
              <div style={{marginBottom:24}}>
                <div style={{fontSize:14,fontWeight:600,color:"rgba(240,236,228,0.7)",marginBottom:12}}>📅 Próximas citas</div>
                {bookings.slice(0,2).map((b,i)=>(
                  <div key={i} className="glass" style={{borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:14,fontWeight:600}}>{b.barber}</div><div style={{fontSize:12,color:"rgba(240,236,228,0.5)"}}>{b.time}</div></div>
                    <div style={{fontSize:13,color:"#c9a84c",fontWeight:600}}>${b.price}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:14,fontWeight:600,color:"rgba(240,236,228,0.7)",marginBottom:12}}>⭐ Más valorados</div>
            {BARBERS.slice(0,2).map(b=>(
              <div key={b.id} className="glass hover-scale" onClick={()=>{setSelectedBarber(b);setScreen("profile-barber");}} style={{borderRadius:18,overflow:"hidden",marginBottom:12,cursor:"pointer",display:"flex"}}>
                <img src={b.img} alt={b.name} style={{width:88,height:88,objectFit:"cover"}}/>
                <div style={{padding:"12px 14px",flex:1}}>
                  <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{b.name}</div>
                  <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:6}}>{b.specialty}</div>
                  <div style={{display:"flex",gap:8}}><span style={{color:"#c9a84c",fontSize:12}}>★ {b.rating}</span><span style={{fontSize:11,color:"rgba(240,236,228,0.3)"}}>{b.distance}</span><span style={{fontSize:12,color:b.color,fontWeight:600}}>${b.price}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {screen==="discover" && (
          <div className="fade-in">
            <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
              {filters.map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 16px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,whiteSpace:"nowrap",background:filter===f?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.06)",color:filter===f?"#0a0a0a":"rgba(240,236,228,0.5)"}}>{f}</button>
              ))}
            </div>
            {currentCard ? (
              <div>
                <div className={swipeDir==="right"?"card-swipe-right":swipeDir==="left"?"card-swipe-left":""} style={{borderRadius:28,overflow:"hidden",position:"relative",boxShadow:"0 32px 64px rgba(0,0,0,0.7)"}}>
                  <img src={currentCard.img} alt={currentCard.name} style={{width:"100%",height:430,objectFit:"cover",display:"block"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"65%",background:"linear-gradient(to top,rgba(0,0,0,0.95),transparent)"}}/>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:22}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                      <div>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:3}}>{currentCard.name}</div>
                        <div style={{fontSize:12,color:"rgba(240,236,228,0.6)",marginBottom:8}}>{currentCard.specialty}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{currentCard.tags.map(t=><span key={t} className="tag">{t}</span>)}</div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:700,color:currentCard.color}}>${currentCard.price}</div></div>
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center"}}>
                      <span style={{color:"#c9a84c",fontSize:13}}>★ {currentCard.rating}</span>
                      <span style={{fontSize:12,color:"rgba(240,236,228,0.4)"}}>({currentCard.reviews})</span>
                      <span style={{fontSize:12,color:"rgba(240,236,228,0.4)"}}>📍 {currentCard.distance}</span>
                    </div>
                    <div style={{marginTop:6,fontSize:12,color:"#c9a84c"}}>🕐 {currentCard.available}</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:20}}>
                  <button onClick={()=>handleSwipe("left")} style={{width:58,height:58,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",fontSize:22,cursor:"pointer"}}>✕</button>
                  <button onClick={()=>{setSelectedBarber(currentCard);setScreen("profile-barber");}} style={{width:46,height:46,borderRadius:"50%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontSize:18,cursor:"pointer",marginTop:6}}>ℹ️</button>
                  <button onClick={()=>handleSwipe("right")} style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#e8c97a)",border:"none",fontSize:22,cursor:"pointer",boxShadow:"0 8px 24px rgba(201,168,76,0.4)"}}>👁️</button>
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:56,marginBottom:14}}>👁️</div>
                <div style={{fontSize:17,fontWeight:600,marginBottom:8}}>¡Visto todo!</div>
                <div style={{color:"rgba(240,236,228,0.4)",marginBottom:24,fontSize:13}}>Has visto todos los barberos.</div>
                <button className="btn-gold" onClick={()=>{setPassed([]);setLiked([]);}} style={{padding:"12px 28px",fontSize:14,borderRadius:14}}>Recargar</button>
              </div>
            )}
          </div>
        )}
        {screen==="chat" && (
          <div className="fade-in" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 220px)"}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>Asistente HORUS ✨</div>
              <div style={{fontSize:11,color:"#c9a84c"}}>● En línea · Claude AI</div>
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
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Pregunta sobre estilos, citas..." style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 15px",color:"#f0ece4",fontSize:14,outline:"none"}}/>
              <button className="btn-gold" onClick={sendMessage} style={{padding:"12px 16px",borderRadius:14,fontSize:18}}>→</button>
            </div>
          </div>
        )}
        {screen==="matches" && (
          <div className="fade-in">
            <div style={{marginBottom:18}}>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700}}>Tus Guardados ❤️</div>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginTop:4}}>{liked.length} guardado{liked.length!==1?"s":""}</div>
            </div>
            {likedBarbers.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontSize:48,marginBottom:14}}>👁️</div>
                <div style={{color:"rgba(240,236,228,0.4)",marginBottom:20,fontSize:14}}>Haz swipe para guardar barberos.</div>
                <button className="btn-gold" onClick={()=>setScreen("discover")} style={{padding:"12px 24px",fontSize:14,borderRadius:14}}>Descubrir</button>
              </div>
            ) : likedBarbers.map(b=>(
              <div key={b.id} className="glass" style={{borderRadius:18,overflow:"hidden",marginBottom:14}}>
                <div style={{display:"flex"}}>
                  <img src={b.img} alt={b.name} style={{width:90,height:90,objectFit:"cover"}}/>
                  <div style={{padding:"12px 14px",flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:2}}>{b.name}</div>
                    <div style={{fontSize:11,color:"rgba(240,236,228,0.4)",marginBottom:6}}>{b.specialty}</div>
                    <div style={{fontSize:12,color:"#c9a84c"}}>🕐 {b.available}</div>
                  </div>
                </div>
                <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:8}}>
                  <button className="btn-gold" onClick={()=>{setSelectedBarber(b);setScreen("profile-barber");}} style={{flex:1,padding:"10px",fontSize:13,borderRadius:12}}>Ver perfil</button>
                  <button onClick={()=>{setSelectedBarber(b);setScreen("booking");}} style={{flex:1,padding:"10px",fontSize:13,borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ece4",cursor:"pointer"}}>📅 Reservar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {screen==="profile-user" && user && (
          <div className="fade-in">
            <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:20}}>← Volver</button>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#e8c97a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px",fontWeight:700,color:"#0a0a0a"}}>{user.name?.[0]?.toUpperCase()}</div>
              <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700}}>{user.name}</div>
              <div style={{fontSize:13,color:"rgba(240,236,228,0.4)",marginTop:4}}>{user.email}</div>
            </div>
            {[["📅","Mis citas",bookings.length],["❤️","Guardados",liked.length],["🔔","Notificaciones",notifications.length]].map(([icon,label,count])=>(
              <div key={label} className="glass hover-scale" style={{borderRadius:16,padding:"16px 18px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                <div style={{fontSize:14}}>{icon} {label}</div>
                <div style={{fontSize:13,color:"#c9a84c",fontWeight:600}}>{count}</div>
              </div>
            ))}
            <button onClick={()=>{setAuthStep("splash");setUser(null);}} style={{width:"100%",marginTop:20,padding:"14px",borderRadius:16,background:"rgba(220,53,69,0.1)",border:"1px solid rgba(220,53,69,0.2)",color:"#ff6b7a",cursor:"pointer",fontSize:14}}>Cerrar sesión</button>
          </div>
        )}
        {screen==="profile-barber" && selectedBarber && (
          <div className="fade-in">
            <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:16}}>← Volver</button>
            <div style={{borderRadius:24,overflow:"hidden",marginBottom:18,position:"relative"}}>
              <img src={selectedBarber.img} alt={selectedBarber.name} style={{width:"100%",height:280,objectFit:"cover"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:"50%",background:"linear-gradient(to top,rgba(0,0,0,0.9),transparent)"}}/>
              <div style={{position:"absolute",bottom:18,left:20}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>{selectedBarber.name}</div>
                <div style={{color:selectedBarber.color,fontSize:13}}>{selectedBarber.specialty}</div>
              </div>
            </div>
            <div className="glass" style={{borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
                <div><div style={{fontSize:20,fontWeight:700,color:"#c9a84c"}}>★ {selectedBarber.rating}</div><div style={{fontSize:10,color:"rgba(240,236,228,0.4)"}}>Rating</div></div>
                <div><div style={{fontSize:20,fontWeight:700}}>{selectedBarber.reviews}</div><div style={{fontSize:10,color:"rgba(240,236,228,0.4)"}}>Reseñas</div></div>
                <div><div style={{fontSize:20,fontWeight:700,color:selectedBarber.color}}>${selectedBarber.price}</div><div style={{fontSize:10,color:"rgba(240,236,228,0.4)"}}>Sesión</div></div>
              </div>
            </div>
            <div className="glass" style={{borderRadius:18,padding:18,marginBottom:14}}>
              <div style={{fontSize:13,color:"rgba(240,236,228,0.65)",lineHeight:1.6}}>{selectedBarber.bio}</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>{selectedBarber.tags.map(t=><span key={t} className="tag" style={{color:selectedBarber.color}}>{t}</span>)}</div>
            <button className="btn-gold" onClick={()=>setScreen("booking")} style={{width:"100%",padding:"15px",fontSize:15,borderRadius:16}}>📅 Reservar · {selectedBarber.available}</button>
          </div>
        )}
        {screen==="booking" && selectedBarber && (
          <div className="fade-in">
            <button onClick={()=>setScreen("profile-barber")} style={{background:"none",border:"none",color:"#c9a84c",fontSize:13,cursor:"pointer",marginBottom:16}}>← Volver</button>
            <div style={{fontSize:20,fontFamily:"'Playfair Display',serif",fontWeight:700,marginBottom:3}}>Reservar cita</div>
            <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:22}}>con {selectedBarber.name}</div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,color:"rgba(240,236,228,0.4)",marginBottom:10}}>Selecciona horario</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {["10:00 AM","11:30 AM","1:00 PM","2:30 PM","4:00 PM","5:30 PM"].map(t=>(
                  <button key={t} onClick={()=>setBookedTime(t)} style={{padding:"12px 6px",borderRadius:14,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,background:bookedTime===t?"linear-gradient(135deg,#c9a84c,#e8c97a)":"rgba(255,255,255,0.06)",color:bookedTime===t?"#0a0a0a":"#f0ece4",transition:"all 0.2s"}}>{t}</button>
                ))}
              </div>
            </div>
            <div className="glass" style={{borderRadius:18,padding:18,marginBottom:20}}>
              {[["Servicio",selectedBarber.specialty,selectedBarber.color],["Barbero",selectedBarber.name.split(" ")[0],null],["Duración","~45 min",null]].map(([k,v,c])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:13,color:"rgba(240,236,228,0.5)"}}>{k}</span>
                  <span style={{fontSize:13,color:c||"#f0ece4"}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                <span style={{fontSize:15,fontWeight:600}}>Total</span>
                <span style={{fontSize:18,fontWeight:700,color:"#c9a84c"}}>${selectedBarber.price}</span>
              </div>
            </div>
            <button className="btn-gold" onClick={()=>{
              if (!bookedTime) { alert("Selecciona un horario."); return; }
              setBookings(prev=>[...prev,{barber:selectedBarber.name.split(" ")[0],time:bookedTime,price:selectedBarber.price}]);
              addNotification("📅 Cita confirmada!",`Tu cita con ${selectedBarber.name.split(" ")[0]} es a las ${bookedTime}.`);
              setScreen("home"); setBookedTime(null);
            }} style={{width:"100%",padding:"15px",fontSize:15,borderRadius:16}}>
              Confirmar reserva {bookedTime?`· ${bookedTime}`:""}
            </button>
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
      <div style={{fontSize:12,color:"rgba(240,236,228,0.5)",marginBottom:7,letterSpacing:"0.5px"}}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"13px 16px",color:"#f0ece4",fontSize:14,outline:"none"}}
        onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.5)"}
        onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
    </div>
  );
}

function SocialAuth() {
  return (
    <div style={{marginTop:28}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
        <span style={{fontSize:12,color:"rgba(240,236,228,0.3)"}}>o continúa con</span>
        <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
      </div>
      <div style={{display:"flex",gap:12}}>
        {[["G","Google","#ea4335"],["f","Facebook","#1877f2"],["🍎","Apple","#f0ece4"]].map(([icon,label,color])=>(
          <button key={label} style={{flex:1,padding:"12px",borderRadius:14,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#f0ece4",cursor:"pointer",fontSize:13,fontWeight:500}}>
            <span style={{color}}>{icon}</span> {label}
          </button>
        ))}
      </div>
    </div>
  );
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
    @keyframes slideRight { to { transform:translateX(120%) rotate(15deg); opacity:0; } }
    @keyframes slideLeft  { to { transform:translateX(-120%) rotate(-15deg); opacity:0; } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spin { to { transform:rotate(360deg); } }
    .card-swipe-right { animation:slideRight 0.4s forwards; }
    .card-swipe-left  { animation:slideLeft  0.4s forwards; }
    .fade-in { animation:fadeIn 0.35s ease forwards; }
    .tag { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:4px 11px; font-size:11px; }
    .btn-gold { background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0a0a; font-weight:600; border:none; border-radius:14px; cursor:pointer; transition:transform 0.15s,opacity 0.15s; }
    .btn-gold:hover { transform:scale(1.02); opacity:0.95; }
    .glass { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(20px); }
    .hover-scale { transition:transform 0.15s; }
    .hover-scale:hover { transform:scale(1.01); }
  `}</style>;}
