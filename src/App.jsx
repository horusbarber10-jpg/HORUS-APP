import { useState, useRef, useEffect } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────
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

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function BarbrApp() {
  const [authStep, setAuthStep] = useState("splash"); // splash | login | register | verify | app
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", code:"" });
  const [formError, setFormError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // app state
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
