/**
 * ── INSTAGRAM CLONE — DATOS ─────────────────────
 *  Editá este archivo para personalizar el contenido.
 *  No necesitás un servidor: abrí index.html directo.
 * ─────────────────────────────────────────────────
 */

/* ── HISTORIAS ────────────────────────────────── */
window.IG_STORIES = [
  {
    id: "s1",
    isYou: true,
    username: "tu_usuario",
    displayName: "Tu historia",
    avatar: "", // Ponés el path de tu imagen acá, ej: "media/avatars/nombre.jpg"
    seen: false,
    slides: [
      { type: "image", file: "media/stories/mi_historia1.jpg", duration: 5,
        text: "Mi primer historia 📸", textColor: "#ffffff", bgColor: "#833ab4" }
    ]
  },
  {
    id: "s2",
    username: "natgeo",
    displayName: "National Geographic",
    avatar: "", // Ponés el path de tu imagen acá, ej: "media/avatars/nombre.jpg"
    seen: false,
    slides: [
      { type: "image", file: "media/stories/natgeo_1.jpg", duration: 5,
        text: "Amanecer en los Andes 🏔️", textColor: "#ffffff", bgColor: "#1a1a2e" },
      { type: "image", file: "media/stories/natgeo_2.jpg", duration: 5,
        text: "La naturaleza nunca deja de sorprendernos 🌿", textColor: "#ffffff", bgColor: "#16213e" }
    ]
  },
  {
    id: "s3",
    username: "tomas.dev",
    displayName: "Tomás Dev",
    avatar: "",
    seen: false,
    slides: [
      { type: "image", file: "media/stories/tomas_1.jpg", duration: 7,
        text: "Nuevo proyecto en marcha 🚀 #webdev", textColor: "#ffffff", bgColor: "#4facfe" }
    ]
  },
  {
    id: "s4",
    username: "foodie_uy",
    displayName: "Comidas del Mundo",
    avatar: "",
    seen: true,
    slides: [
      { type: "image", file: "media/stories/foodie_1.jpg", duration: 5,
        text: "Empanadas recién hechas 🥟🔥", textColor: "#ffffff", bgColor: "#fa709a" },
      { type: "image", file: "media/stories/foodie_2.jpg", duration: 5,
        text: "Asado de domingo con los amigos 🥩", textColor: "#ffffff", bgColor: "#f77f00" }
    ]
  },
  {
    id: "s5",
    username: "viajes_latam",
    displayName: "Viajes LATAM",
    avatar: "",
    seen: true,
    slides: [
      { type: "image", file: "media/stories/viajes_1.jpg", duration: 6,
        text: "Machu Picchu desde arriba 🌄", textColor: "#ffffff", bgColor: "#43e97b" }
    ]
  },
  {
    id: "s6",
    username: "arte_digital",
    displayName: "Arte Digital",
    avatar: "",
    seen: false,
    slides: [
      { type: "image", file: "media/stories/arte_1.jpg", duration: 5,
        text: "Nueva obra disponible 🎨", textColor: "#ffffff", bgColor: "#a18cd1" }
    ]
  },
  {
    id: "s7",
    username: "surfing_sa",
    displayName: "Surf Sudamérica",
    avatar: "",
    seen: false,
    slides: [
      { type: "image", file: "media/stories/surf_1.jpg", duration: 5,
        text: "Las olas están increíbles hoy 🌊🏄", textColor: "#ffffff", bgColor: "#4facfe" },
      { type: "image", file: "media/stories/surf_2.jpg", duration: 5,
        text: "Punta del Este siempre sorprende 🏖️", textColor: "#ffffff", bgColor: "#00f2fe" }
    ]
  }
];

/* ── FEED ─────────────────────────────────────── */
window.IG_FEED = [
  {
    id: "1",
    username: "natgeo",
    displayName: "National Geographic",
    avatar: "", // Ponés el path de tu imagen acá, ej: "media/avatars/nombre.jpg"
    verified: true,
    type: "image",
    file: "media/feed/natgeo1.jpg",
    title: "Amanecer en la Patagonia",
    description: "Las primeras luces del día iluminan los picos nevados de la Patagonia argentina. Un espectáculo que pocas personas tienen el privilegio de presenciar. 🏔️✨ #naturaleza #patagonia #argentina #fotografia #amanecer",
    date: "2026-06-23",
    likes: 48293,
    comments: 342,
    location: "Patagonia, Argentina"
  },
  {
    id: "2",
    username: "tomas.dev",
    displayName: "Tomás Desarrollador",
    avatar: "",
    verified: false,
    type: "video",
    file: "media/feed/code_timelapse.mp4",
    title: "Construyendo el futuro",
    description: "Otra noche de código y café ☕💻 Construyendo algo genial. ¿Adivinan qué es? #programming #developer #webdev #javascript #coding",
    date: "2026-06-22",
    likes: 1204,
    comments: 87,
    location: "Buenos Aires, Argentina"
  },
  {
    id: "3",
    username: "foodie_uy",
    displayName: "Comidas del Mundo",
    avatar: "",
    verified: false,
    type: "image",
    file: "media/feed/asado.jpg",
    title: "El mejor asado",
    description: "Nada como un buen asado argentino con amigos. El olor a leña y la compañía perfecta 🥩🔥 #asado #argentina #foodie #bbq #grilling",
    date: "2026-06-21",
    likes: 3891,
    comments: 215,
    location: "Montevideo, Uruguay"
  },
  {
    id: "4",
    username: "viajes_latam",
    displayName: "Viajes por Latinoamérica",
    avatar: "",
    verified: true,
    type: "image",
    file: "media/feed/machu_picchu.jpg",
    title: "Machu Picchu al amanecer",
    description: "La ciudadela inca envuelta en niebla al amanecer. Una experiencia que cambia la vida 🌄🏛️ #machupicchu #peru #incas #travel #wanderlust #southamerica",
    date: "2026-06-20",
    likes: 22104,
    comments: 891,
    location: "Machu Picchu, Perú"
  },
  {
    id: "5",
    username: "arte_digital",
    displayName: "Arte & Diseño Digital",
    avatar: "",
    verified: false,
    type: "image",
    file: "media/feed/arte1.jpg",
    title: "Nueva obra generativa",
    description: "Explorando los límites entre el arte y la tecnología. Esta pieza fue generada con algoritmos propios 🎨🤖 #arte #digitalart #generativeart #design #creative",
    date: "2026-06-19",
    likes: 5672,
    comments: 134,
    location: null
  },
  {
    id: "6",
    username: "surfing_sa",
    displayName: "Surf Sudamerica",
    avatar: "",
    verified: false,
    type: "video",
    file: "media/feed/surf_session.mp4",
    title: "Sesión épica en Punta del Este",
    description: "Las olas estuvieron increíbles hoy 🌊🏄 Una de las mejores sesiones del año. ¡Gracias al mar! #surf #puntadeleste #olas #surfing #ocean",
    date: "2026-06-18",
    likes: 8934,
    comments: 276,
    location: "Punta del Este, Uruguay"
  }
];

/* ── REELS ────────────────────────────────────── */
window.IG_REELS = [
  {
    id: "1",
    username: "viajes_latam",
    displayName: "Viajes por Latinoamérica",
    avatar: "",
    verified: true,
    file: "media/reels/patagonia_reel.mp4",
    title: "Aventura en los Andes",
    description: "Descubriendo los secretos de los Andes en un viaje épico de 3 semanas 🌄⛰️ #viaje #andes #aventura #patagonia",
    date: "2026-06-23",
    likes: 142500,
    comments: 3892,
    views: 1500000,
    audio: "Original Audio - viajes_latam"
  },
  {
    id: "2",
    username: "chef_marcos",
    displayName: "Chef Marcos Rodríguez",
    avatar: "",
    verified: true,
    file: "media/reels/receta_empanadas.mp4",
    title: "Las empanadas perfectas",
    description: "El secreto de las mejores empanadas tucumanas en menos de 60 segundos 🥟🔥 #cocina #empanadas #argentina #receta #chef",
    date: "2026-06-22",
    likes: 89400,
    comments: 2341,
    views: 890000,
    audio: "Original Audio - chef_marcos"
  },
  {
    id: "3",
    username: "tomas.dev",
    displayName: "Tomás Desarrollador",
    avatar: "",
    verified: false,
    file: "media/reels/dev_tips.mp4",
    title: "3 trucos de CSS que cambiarán tu vida",
    description: "Estos tricks de CSS me ahorraron horas de trabajo 💻✨ #css #webdev #programming #tips #developer",
    date: "2026-06-21",
    likes: 45200,
    comments: 1876,
    views: 420000,
    audio: "Lo-Fi Study Beats - ChillHop Music"
  },
  {
    id: "4",
    username: "surfing_sa",
    displayName: "Surf Sudamerica",
    avatar: "",
    verified: false,
    file: "media/reels/surf_pde.mp4",
    title: "Olas perfectas en Uruguay",
    description: "Cuando el mar te regala olas perfectas no hay nada más que pedir 🌊🏄 #surf #uruguay #ocean #waves",
    date: "2026-06-20",
    likes: 67800,
    comments: 943,
    views: 650000,
    audio: "Ocean Vibes - Tropical Sound"
  },
  {
    id: "5",
    username: "arte_digital",
    displayName: "Arte & Diseño Digital",
    avatar: "",
    verified: false,
    file: "media/reels/arte_proceso.mp4",
    title: "Proceso creativo completo",
    description: "De la idea en blanco al arte terminado. Todo el proceso en 60 segundos 🎨 #art #digitalart #process #creative #design",
    date: "2026-06-19",
    likes: 31200,
    comments: 654,
    views: 280000,
    audio: "Synthwave Dreams - RetroWave"
  }
];

/* ── NOTIFICACIONES ───────────────────────────── */
window.IG_NOTIFICATIONS = [
  {
    id: "n1", type: "follow_request",
    username: "foto_viajera", displayName: "Foto Viajera",
    avatar: "",
    text: "quiere seguirte.", date: "2026-06-23T14:30:00", read: false
  },
  {
    id: "n2", type: "follow_request",
    username: "dev_latam", displayName: "Dev Latinoamérica",
    avatar: "",
    text: "quiere seguirte.", date: "2026-06-23T11:15:00", read: false
  },
  {
    id: "n3", type: "follow_request",
    username: "gastronomia_ar", displayName: "Gastronomía Argentina",
    avatar: "",
    text: "quiere seguirte.", date: "2026-06-22T20:00:00", read: false
  },
  {
    id: "n4", type: "like",
    username: "natgeo", displayName: "National Geographic",
    avatar: "", // Ponés el path de tu imagen acá, ej: "media/avatars/nombre.jpg" verified: true,
    text: "le gustó tu foto.", date: "2026-06-23T13:00:00", read: false,
    postThumb: "", postThumbBg: "#833ab4"
  },
  {
    id: "n5", type: "like",
    username: "tomas.dev", displayName: "Tomás Dev",
    avatar: "",
    text: "le gustó tu foto.", date: "2026-06-23T12:45:00", read: false,
    postThumb: "", postThumbBg: "#4facfe"
  },
  {
    id: "n6", type: "like",
    username: "viajes_latam", displayName: "Viajes LATAM",
    avatar: "", verified: true,
    text: "le gustó tu video.", date: "2026-06-23T10:20:00", read: true,
    postThumb: "", postThumbBg: "#43e97b"
  },
  {
    id: "n7", type: "comment",
    username: "foodie_uy", displayName: "Comidas del Mundo",
    avatar: "",
    text: "comentó en tu foto: \"¡Increíble toma! Ese color del cielo es una locura 😍\"",
    date: "2026-06-23T09:30:00", read: true,
    postThumb: "", postThumbBg: "#fa709a"
  },
  {
    id: "n8", type: "comment",
    username: "surfing_sa", displayName: "Surf Sudamérica",
    avatar: "",
    text: "comentó en tu foto: \"¡Esas olas se ven épicas! ¿Dónde fue esto? 🏄\"",
    date: "2026-06-22T18:00:00", read: true,
    postThumb: "", postThumbBg: "#00f2fe"
  },
  {
    id: "n9", type: "mention",
    username: "arte_digital", displayName: "Arte Digital",
    avatar: "",
    text: "te mencionó en un comentario: \"@tu_usuario esto te va a gustar 🎨\"",
    date: "2026-06-22T15:30:00", read: true,
    postThumb: "", postThumbBg: "#a18cd1"
  },
  {
    id: "n10", type: "follow",
    username: "musica_sa", displayName: "Música Sudamérica",
    avatar: "",
    text: "empezó a seguirte.", date: "2026-06-22T10:00:00", read: true
  },
  {
    id: "n11", type: "like",
    username: "deportes_uy", displayName: "Deportes Uruguay",
    avatar: "",
    text: "y otras 14 personas les gustó tu foto.",
    date: "2026-06-21T20:00:00", read: true,
    postThumb: "", postThumbBg: "#fd1d1d"
  },
  {
    id: "n12", type: "follow",
    username: "foto_viajera", displayName: "Foto Viajera",
    avatar: "",
    text: "también empezó a seguirte.", date: "2026-06-20T14:00:00", read: true
  }
];

/* ── MENSAJES ─────────────────────────────────── */
window.IG_MESSAGES = [
  {
    id: "c1",
    username: "natgeo", displayName: "National Geographic",
    avatar: "", // Ponés el path de tu imagen acá, ej: "media/avatars/nombre.jpg" verified: true,
    online: true, unread: 2,
    messages: [
      { id: "m1", from: "natgeo",    text: "¡Hola! Vimos que te gustaron nuestras fotos de la Patagonia 🌄", date: "2026-06-23T08:00:00" },
      { id: "m2", from: "me",        text: "¡Sí! Son increíbles. ¿Cómo hacen para llegar a esos lugares?",  date: "2026-06-23T08:05:00" },
      { id: "m3", from: "natgeo",    text: "Tenemos fotógrafos en todo el mundo que dedican meses a cada expedición 📷", date: "2026-06-23T08:10:00" },
      { id: "m4", from: "me",        text: "Wow, suena increíble. ¡Me gustaría hacer algo así algún día!", date: "2026-06-23T08:12:00" },
      { id: "m5", from: "natgeo",    text: "¡Podés postularte a nuestro programa de fotógrafos emergentes! 🌍", date: "2026-06-23T09:00:00" },
      { id: "m6", from: "natgeo",    text: "Acá te dejo el link con toda la info 👆", date: "2026-06-23T09:01:00" }
    ]
  },
  {
    id: "c2",
    username: "tomas.dev", displayName: "Tomás Dev",
    avatar: "", verified: false,
    online: true, unread: 0,
    messages: [
      { id: "m1", from: "tomas.dev", text: "Ey! Vi que también usás JavaScript, ¿te interesa colaborar en un proyecto?", date: "2026-06-22T15:00:00" },
      { id: "m2", from: "me",        text: "¡Claro! ¿De qué se trata?", date: "2026-06-22T15:30:00" },
      { id: "m3", from: "tomas.dev", text: "Estoy armando una app de mapas para comunidades locales. Full stack con Node y React.", date: "2026-06-22T15:35:00" },
      { id: "m4", from: "me",        text: "Suena muy bien. ¿Cuándo arrancamos?", date: "2026-06-22T15:40:00" },
      { id: "m5", from: "tomas.dev", text: "La semana que viene! Te mando el repositorio 🚀", date: "2026-06-22T15:41:00" }
    ]
  },
  {
    id: "c3",
    username: "viajes_latam", displayName: "Viajes LATAM",
    avatar: "", verified: true,
    online: false, unread: 1,
    messages: [
      { id: "m1", from: "viajes_latam", text: "¡Hola! ¿Ya visitaste la Patagonia? 🏔️", date: "2026-06-21T10:00:00" },
      { id: "m2", from: "me",           text: "Todavía no, pero está en mi lista de pendientes 😅", date: "2026-06-21T10:10:00" },
      { id: "m3", from: "viajes_latam", text: "¡Tenemos paquetes increíbles para fin de año! Menos de $800 USD todo incluido 🌄", date: "2026-06-23T11:00:00" }
    ]
  },
  {
    id: "c4",
    username: "foodie_uy", displayName: "Comidas del Mundo",
    avatar: "", verified: false,
    online: false, unread: 0,
    messages: [
      { id: "m1", from: "me",        text: "¿Me pasás la receta de las empanadas que publicaste? 🥟", date: "2026-06-20T12:00:00" },
      { id: "m2", from: "foodie_uy", text: "¡Claro! 500g de harina, 200g de manteca, sal... ¿querés el relleno también?", date: "2026-06-20T12:15:00" },
      { id: "m3", from: "me",        text: "¡Sí por favor! Las quiero hacer este finde", date: "2026-06-20T12:16:00" },
      { id: "m4", from: "foodie_uy", text: "Relleno: 500g de carne picada, 2 cebollas, pimentón, comino y ají molido. Dorás la cebolla, agregás la carne y condimentás. ¡Fácil! 🔥", date: "2026-06-20T12:20:00" },
      { id: "m5", from: "me",        text: "¡Gracias! Ya te cuento cómo salen 😊", date: "2026-06-20T12:22:00" }
    ]
  },
  {
    id: "c5",
    username: "surfing_sa", displayName: "Surf Sudamérica",
    avatar: "", verified: false,
    online: true, unread: 0,
    messages: [
      { id: "m1", from: "surfing_sa", text: "¿Sabés surfear? 🏄", date: "2026-06-19T16:00:00" },
      { id: "m2", from: "me",         text: "Algo básico, ¡me encantaría mejorar!", date: "2026-06-19T16:05:00" },
      { id: "m3", from: "surfing_sa", text: "Damos clases en Punta del Este todos los fines de semana. ¡Te esperamos! 🌊", date: "2026-06-19T16:10:00" }
    ]
  },
  {
    id: "c6",
    username: "arte_digital", displayName: "Arte Digital",
    avatar: "", verified: false,
    online: false, unread: 0,
    messages: [
      { id: "m1", from: "arte_digital", text: "¡Me encantó tu comentario sobre mi última pieza! 🎨", date: "2026-06-18T20:00:00" },
      { id: "m2", from: "me",           text: "¡Es hermosa! ¿Cuánto tiempo tardaste en hacerla?", date: "2026-06-18T20:10:00" },
      { id: "m3", from: "arte_digital", text: "Unas 3 horas de proceso generativo más 2 de curación y edición. No es tan rápido como parece 😅", date: "2026-06-18T20:15:00" }
    ]
  }
];


/* ── PERFIL PROPIO ────────────────────────────── */
window.IG_PROFILE = {
  username:    "tu_usuario",        // Tu @
  displayName: "Tu Nombre",         // Nombre visible
  avatar:      "",                  // "media/avatars/yo.jpg"
  verified:    false,
  bio:         "✨ Esto es una bio de ejemplo.\nPodés poner varias líneas.\n🌍 Alguna ciudad",
  website:     "https://tusitio.com",  // Dejá "" para ocultar
  category:    "",                  // Ej: "Fotógrafo", "Músico" — dejá "" para ocultar
  postsCount:  42,
  followers:   1380,
  following:   290,

  // Highlights — historia destacada (sin expirar)
  highlights: [
    { id: "h1", title: "Viajes",   cover: "", bgColor: "#f77f00" },
    { id: "h2", title: "Comida",   cover: "", bgColor: "#d62828" },
    { id: "h3", title: "Trabajo",  cover: "", bgColor: "#023e8a" },
    { id: "h4", title: "Amigos",   cover: "", bgColor: "#588157" },
    { id: "h5", title: "Mascotas", cover: "", bgColor: "#9b2226" }
  ],

  // Posts propios que aparecen en la grilla del perfil
  // Cada uno: { id, type("image"|"video"), file, thumb, bgColor, alt }
  posts: [
    { id: "p1", type: "image", file: "", thumb: "", bgColor: "#833ab4", alt: "Post 1" },
    { id: "p2", type: "image", file: "", thumb: "", bgColor: "#fd1d1d", alt: "Post 2" },
    { id: "p3", type: "video", file: "", thumb: "", bgColor: "#fcb045", alt: "Post 3" },
    { id: "p4", type: "image", file: "", thumb: "", bgColor: "#4facfe", alt: "Post 4" },
    { id: "p5", type: "image", file: "", thumb: "", bgColor: "#43e97b", alt: "Post 5" },
    { id: "p6", type: "video", file: "", thumb: "", bgColor: "#f953c6", alt: "Post 6" },
    { id: "p7", type: "image", file: "", thumb: "", bgColor: "#0f3460", alt: "Post 7" },
    { id: "p8", type: "image", file: "", thumb: "", bgColor: "#e94560", alt: "Post 8" },
    { id: "p9", type: "image", file: "", thumb: "", bgColor: "#16213e", alt: "Post 9" }
  ]
};
