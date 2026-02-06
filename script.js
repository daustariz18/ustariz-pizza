const WHATSAPP_NUMBER = "573001720582";

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

/* ================= TABS ================= */
function renderTabs() {
  const tabs = document.getElementById("tabs-bar");
  tabs.innerHTML = "";

  Object.keys(MENU).forEach(size => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${size === activeSize ? "active" : ""}`;
    btn.textContent = size;
    btn.onclick = () => {
      activeSize = size;
      selected = [];
      updateSummary();
      renderTabs();
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
function updateSummary() {
  const totalEl = document.getElementById("total-price");
  const selectionEl = document.getElementById("selection-text");
  const orderBtn = document.getElementById("submit-order");
  const barrio = document.getElementById("barrio").value;

  selectionEl.textContent = `${selected.length}/2 sabores`;
  selectionEl.style.color = selected.length === 2 ? "#25d366" : "white";

  if (selected.length === 0 || !barrio) {
    totalEl.textContent = "$0";
    orderBtn.disabled = true;
    return;
  }

  const pizza = Math.max(...selected.map(s => MENU[activeSize][s]));
  const domicilio = BARRIOS[barrio];
  const total = pizza + domicilio;

  totalEl.textContent = `$${total.toLocaleString()}`;
  orderBtn.disabled = false;
}

/* ================= PEDIDO ================= */
function handleOrder() {
  const dir = document.getElementById("direccion").value;
  const barrio = document.getElementById("barrio").value;

  if (!dir || !barrio || selected.length === 0) {
    alert("Completa el pedido");
    return;
  }

  const pizza = Math.max(...selected.map(s => MENU[activeSize][s]));
  const domicilio = BARRIOS[barrio];
  const total = pizza + domicilio;

  const descripcion =
    selected.length === 2
      ? `${activeSize} 1/2 de ${selected[0]} 1/2 de ${selected[1]}`
      : `${activeSize} de ${selected[0]}`;

  const msg =
`🍕 *USTARIZ PIZZA*

📦 *Pedido:* ${descripcion}
🏘️ *Barrio:* ${barrio}
🚚 *Domicilio:* $${domicilio.toLocaleString()}
💰 *Total:* $${total.toLocaleString()}
📍 *Dirección:* ${dir}`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/* ================= INIT ================= */
loadBarrios();
renderTabs();
renderMenu();
