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
    const infoExtra = size === "Small" ? "(8 Porciones)" : 
                      size === "Medium" ? "(8 Porciones.)" : 
                      size === "Large" ? "(8 Porciones.)" :
                      size === "X-Large" ? "(10 Porciones.)" : "(10 Porc.)";

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

/* ================= TOTAL ================= */
/* ================= TOTAL CORREGIDO ================= */
function updateSummary() {
  const totalEl = document.getElementById("total-price");
  const selectionEl = document.getElementById("selection-text");
  const orderBtn = document.getElementById("submit-order");
  const barrioKey = document.getElementById("barrio").value;
  
  // CORRECCIÓN: Usar el ID correcto del HTML
  const direccion = document.getElementById("direccion_principal").value;

  selectionEl.textContent = `${selected.length}/2 sabores`;
  selectionEl.style.color = selected.length > 0 ? "var(--price)" : "white";

  if (selected.length === 0) {
    totalEl.textContent = "$0";
    orderBtn.disabled = true;
    return;
  }

  const precioPizza = Math.max(...selected.map(s => MENU[activeSize][s]));
  const precioDomicilio = barrioKey ? BARRIOS[barrioKey] : 0;
  const totalFinal = precioPizza + precioDomicilio;

  totalEl.textContent = `$${totalFinal.toLocaleString()}`;

  // Se activa si hay sabores, barrio y dirección
  orderBtn.disabled = !(selected.length > 0 && barrioKey && direccion);
}

/* ================= PEDIDO ================= */
function handleOrder() {
  const dirPrincipal = document.getElementById("direccion_principal").value;
  const torre = document.getElementById("torre").value;
  const apto = document.getElementById("apto").value;
  const barrio = document.getElementById("barrio").value;
  const notas = document.getElementById("indicaciones").value;

  const pizzaPrecio = Math.max(...selected.map(s => MENU[activeSize][s]));
  const domicilio = BARRIOS[barrio];
  const total = pizzaPrecio + domicilio;

  const descripcion = selected.length === 2
      ? `${activeSize} (1/2 ${selected[0]} - 1/2 ${selected[1]})`
      : `${activeSize} de ${selected[0]}`;

  const msg = `🍕 *USTARIZ PIZZA*
--------------------------
📦 *Pedido:* ${descripcion}
🏘️ *Barrio:* ${barrio}
📍 *Dirección:* ${dirPrincipal} ${torre ? '- T:'+torre : ''} ${apto ? '- Apt:'+apto : ''}
ℹ️ *Notas:* ${notas || 'Ninguna'}
--------------------------
🚚 *Domicilio:* $${domicilio.toLocaleString()}
💰 *TOTAL:* $${total.toLocaleString()}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}
/* ================= INIT ================= */
loadBarrios();
renderTabs();
renderMenu();
