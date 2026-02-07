const WHATSAPP_NUMBER = "573001720582";

/* Objeto con los mensajes de recomendación */
const RECO_MESSAGES = {
  "Small": "Ideal para 1 - 2 personas",
  "Medium": "Ideal para 2 - 3 personas",
  "Large": "Ideal para 3 - 4 personas",
  "X-Large": "Ideal para 4 - 5 personas"
};

/* ================= IMÁGENES ================= */
const IMAGES = {
  "Salami": "img/salami.png",
  "Jamon": "img/Jamon.png",
  "Pollo": "img/Pollo.png",
  "Pepperoni": "img/pepperoni.png",
  "Salami Pimenton": "img/Salami-Pimenton.png",
  "Hawaiana": "img/Hawaiana.png",
  "Pollo Jamon": "img/Jamon-Pollo.png",
  "3 Carnes": "img/3-Carnes.png"
};

/* ================= MENÚ ================= */
const MENU = {
  "Small": {
    "Salami": 28000,
    "Jamon": 28000,
    "Pollo": 29000,
    "Pepperoni": 30000,
    "Salami Pimenton": 28000,
    "Hawaiana": 30000,
    "Pollo Jamon": 30000,
    "3 Carnes": 32000
  },
  "Medium": {
    "Salami": 38000,
    "Jamon": 38000,
    "Pollo": 39000,
    "Pepperoni": 40000,
    "Salami Pimenton": 38000,
    "Hawaiana": 40000,
    "Pollo Jamon": 40000,
    "3 Carnes": 42000
  },
  "Large": {
    "Salami": 48000,
    "Jamon": 48000,
    "Pollo": 49000,
    "Pepperoni": 50000,
    "Salami Pimenton": 48000,
    "Hawaiana": 50000,
    "Pollo Jamon": 50000,
    "3 Carnes": 52000
  },
  "X-Large": {
    "Salami": 58000,
    "Jamon": 58000,
    "Pollo": 59000,
    "Pepperoni": 60000,
    "Salami Pimenton": 58000,
    "Hawaiana": 60000,
    "Pollo Jamon": 60000,
    "3 Carnes": 62000
  }
};

/* ================= DOMICILIOS ================= */
const BARRIOS = {
  "Balcones del Mar":0,
  "Miramar": 5000,
  "El Tabor": 6000,
  "Alameda del Rio": 8000,
  "Buenavista": 8000,
  "Villa Santos": 6000,
  "Villa Campestre": 10000
};

/* ================= ESTADO ================= */
let activeSize = "Small";
let selected = [];

/* ================= BARRIOS ================= */
function loadBarrios() {
  const select = document.getElementById("barrio");
  Object.entries(BARRIOS).forEach(([barrio, valor]) => {
    const opt = document.createElement("option");
    opt.value = barrio;
    opt.textContent = `${barrio} (+$${valor.toLocaleString()})`;
    select.appendChild(opt);
  });
}

function renderTabs() {
  const tabs = document.getElementById("tabs-bar");
  const recoLabel = document.getElementById("size-recommendation-label"); // Referencia a la nueva label
  
  tabs.innerHTML = "";

  // Actualizar el texto de la recomendación según el activeSize
  if (activeSize) {
    recoLabel.innerHTML = `👥 ${RECO_MESSAGES[activeSize]}`;
    recoLabel.style.display = "block";
  }

  Object.keys(MENU).forEach(size => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${size === activeSize ? "active" : ""}`;
    
    // Usamos la estructura informativa de Salvatore
    const infoExtra = size === "Small" ? "(8 Porciones) - 26cm" : 
                      size === "Medium" ? "(8 Porciones) - 30cm" : 
                      size === "Large" ? "(8 Porciones) - 35cm" :
                      size === "X-Large" ? "(10 Porciones) - 40cm" : "(10 Porciones) - 45cm";

    btn.innerHTML = `
      <span class="size-name">${size}</span>
      <span class="size-info">${infoExtra}</span>
    `;

    btn.onclick = () => {
      activeSize = size;
      selected = [];
      updateSummary();
      renderTabs(); // Esto actualizará la label automáticamente
      renderMenu();
    };
    tabs.appendChild(btn);
  });
}

/* ================= MENÚ ================= */
function renderMenu() {
  const grid = document.getElementById("menu-content");
  grid.innerHTML = "";

  Object.entries(MENU[activeSize]).forEach(([sabor, precio]) => {
    const card = document.createElement("div");
    card.className = `pizza-card ${selected.includes(sabor) ? "selected" : ""}`;

    card.innerHTML = `
      <div class="pizza-image">
        <img src="${IMAGES[sabor]}" alt="${sabor}" onerror="this.src='img/logo.png'">
        <div class="overlay">
          <h3>${sabor}</h3>
          <span>$${precio.toLocaleString()}</span>
        </div>
      </div>
    `;

    card.onclick = () => toggleFlavor(sabor);
    grid.appendChild(card);
  });
}

/* ================= SELECCIÓN ================= */
function toggleFlavor(sabor) {
  if (selected.includes(sabor)) {
    selected = selected.filter(s => s !== sabor);
  } else {
    if (selected.length === 2) {
      alert("Solo puedes elegir hasta 2 sabores");
      return;
    }
    selected.push(sabor);
  }
  updateSummary();
  renderMenu();
}

/* ================= RESUMEN Y PAGOS ================= */
function updateSummary() {
  const barrioKey = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value;
  const paymentSection = document.getElementById("payment-section");
  const metodoPagoEl = document.getElementById("metodo-pago");
  const optEfectivo = document.getElementById("opt-efectivo");
  const orderBtn = document.getElementById("submit-order");
  const totalEl = document.getElementById("total-price");

  // AÑADE ESTA LÍNEA AQUÍ:
  document.getElementById("selection-text").textContent = `${selected.length}/2 sabores`;

  // 1. CONTROL DE VISIBILIDAD: Solo mostrar si seleccionó barrio
  if (barrioKey) {
    paymentSection.style.display = "block";
    
    // 2. LÓGICA DE BALCONES DEL MAR (EFECTIVO)
    if (barrioKey === "Balcones del Mar") {
      optEfectivo.disabled = false;
      optEfectivo.textContent = "💵 Efectivo";
    } else {
      optEfectivo.disabled = true;
      optEfectivo.textContent = "❌ Efectivo (No disponible en este barrio)";
      // Si tenía "Efectivo" seleccionado y cambia a otro barrio, resetear el pago
      if (metodoPagoEl.value === "Efectivo") {
        metodoPagoEl.value = "";
      }
    }
  } else {
    paymentSection.style.display = "none";
    metodoPagoEl.value = ""; // Resetear selección si quita el barrio
  }

  // 3. CÁLCULO DE TOTAL
  if (selected.length > 0) {
    const precioPizza = Math.max(...selected.map(s => MENU[activeSize][s]));
    const costoDomicilio = BARRIOS[barrioKey] || 0;
    const total = precioPizza + costoDomicilio;
    totalEl.textContent = `$${total.toLocaleString()}`;
  } else {
    totalEl.textContent = "$0";
  }

  // 4. VALIDACIÓN DEL BOTÓN FINAL
  // Se activa solo si hay: Sabores + Barrio + Dirección + Método de Pago
  const pagoSeleccionado = metodoPagoEl.value;
  orderBtn.disabled = !(selected.length > 0 && barrioKey && direccion && pagoSeleccionado);
}
/* ================= ENVÍO A WHATSAPP ================= */
function handleOrder() {
  const telefono = document.getElementById("telefono").value;
  const barrio = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value;
  const torre = document.getElementById("torre").value;
  const apto = document.getElementById("apto").value;
  const indicaciones = document.getElementById("indicaciones").value;
  const pago = document.getElementById("metodo-pago").value;

  const sabores = selected.join(" y ");
  const precioPizza = Math.max(...selected.map(s => MENU[activeSize][s]));
  const domicilio = BARRIOS[barrio] || 0;
  const total = precioPizza + domicilio;

  const direccionCompleta = `
${direccion}
${torre ? "Torre " + torre : ""} ${apto ? "Apto " + apto : ""}
${indicaciones ? "Notas: " + indicaciones : ""}
`;

  const msg = `
🍕 *USTARIZ PIZZA*
--------------------------
📏 *Tamaño:* ${activeSize}
🍕 *Sabores:* ${sabores}
🏘️ *Barrio:* ${barrio}
📍 *Dirección:* ${direccionCompleta}
💳 *Pago:* ${pago}
💰 *TOTAL:* $${total.toLocaleString()}

📞 *Tel:* ${telefono}
  `.trim();

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/* ================= INIT ================= */
loadBarrios();
renderTabs();
renderMenu();
