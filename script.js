const WHATSAPP_NUMBER = "573001720582";

const CUENTAS_PAGO = {
  "Nequi": "3007014434",
  "Daviplata": "3128896624",
  "Efectivo": "Efectivo"
};

const RECO_MESSAGES = {
  "Small": "Ideal para 1 - 2 personas",
  "Medium": "Ideal para 2 - 3 personas",
  "Large": "Ideal para 3 - 4 personas",
  "X-Large": "Ideal para 4 - 5 personas",
  "Familiar": "Ideal para 5 - 6 personas"
};

const IMAGES = {
  "Salami": "img/salami.png", "Jamon": "img/Jamon.png", "Pollo": "img/Pollo.png",
  "Pepperoni": "img/pepperoni.png", "Salami Pimenton": "img/Salami-Pimenton.png",
  "Hawaiana": "img/Hawaiana.png", "Pollo Jamon": "img/Jamon-Pollo.png", "3 Carnes": "img/3-Carnes.png"
};

const MENU = {
  "Small": { "Salami": 30000, "Jamon": 30000, "Pollo": 30000, "Pepperoni": 32000, "Salami Pimenton": 30000, "Hawaiana": 32000, "Pollo Jamon": 32000, "3 Carnes": 34000 },
  "Medium": { "Salami": 40000, "Jamon": 40000, "Pollo": 40000, "Pepperoni": 42000, "Salami Pimenton": 40000, "Hawaiana": 42000, "Pollo Jamon": 42000, "3 Carnes": 44000 },
  "Large": { "Salami": 50000, "Jamon": 50000, "Pollo": 50000, "Pepperoni": 52000, "Salami Pimenton": 50000, "Hawaiana": 52000, "Pollo Jamon": 52000, "3 Carnes": 54000 },
  "X-Large": { "Salami": 60000, "Jamon": 60000, "Pollo": 60000, "Pepperoni": 62000, "Salami Pimenton": 60000, "Hawaiana": 62000, "Pollo Jamon": 62000, "3 Carnes": 64000 },
  "Familiar": { "Salami": 75000, "Jamon": 75000, "Pollo": 75000, "Pepperoni": 78000, "Salami Pimenton": 75000, "Hawaiana": 78000, "Pollo Jamon": 78000, "3 Carnes": 80000 }
};

const BARRIOS = {
  "Balcones del Mar": 0, "Miramar": 5000, "El Tabor": 6000,
  "Alameda del Rio": 8000, "Buenavista": 8000, "Villa Santos": 6000, "Villa Campestre": 10000
};

/* ================= ESTADO ================= */
let activeSize = "Small";
let selectedFlavors = [];
let cart = [];

/* ================= COMPONENTES DE UI ================= */
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
  const recoLabel = document.getElementById("size-recommendation-label");
  tabs.innerHTML = "";

  if (activeSize) {
    recoLabel.innerHTML = `👥 ${RECO_MESSAGES[activeSize]}`;
    recoLabel.style.display = "block";
  }

  Object.keys(MENU).forEach(size => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${size === activeSize ? "active" : ""}`;
    
    let infoExtra = "";
    if (size === "Small") infoExtra = "(8 Porciones) - 26cm";
    else if (size === "Medium") infoExtra = "(8 Porciones) - 30cm";
    else if (size === "Large") infoExtra = "(8 Porciones) - 35cm";
    else if (size === "X-Large") infoExtra = "(10 Porciones) - 40cm";
    else if (size === "Familiar") infoExtra = "(12 Porciones) - 50cm";
    btn.innerHTML = `<span class="size-name">${size}</span><span class="size-info">${infoExtra}</span>`;
    btn.onclick = () => {
      activeSize = size;
      selectedFlavors = [];
      updateSummary();
      renderTabs();
      renderMenu();
    };
    tabs.appendChild(btn);
  });
}

function renderMenu() {
  const grid = document.getElementById("menu-content");
  grid.innerHTML = "";

  Object.entries(MENU[activeSize]).forEach(([sabor, precio]) => {
    const card = document.createElement("div");
    card.className = `pizza-card ${selectedFlavors.includes(sabor) ? "selected" : ""}`;
    card.innerHTML = `
      <div class="pizza-image">
        <img src="${IMAGES[sabor]}" alt="${sabor}" onerror="this.src='img/logo.png'">
        <div class="overlay"><h3>${sabor}</h3><span>$${precio.toLocaleString()}</span></div>
      </div>`;
    card.onclick = () => toggleFlavor(sabor);
    grid.appendChild(card);
  });
}

function toggleFlavor(sabor) {
  if (selectedFlavors.includes(sabor)) {
    selectedFlavors = selectedFlavors.filter(s => s !== sabor);
  } else {
    if (selectedFlavors.length === 2) {
      alert("Solo puedes elegir hasta 2 sabores");
      return;
    }
    selectedFlavors.push(sabor);
  }
  updateSummary();
  renderMenu();
}

/* ================= LÓGICA DE CARRITO ================= */
function addToCart() {
  if (selectedFlavors.length === 0) {
    alert("Selecciona al menos 1 sabor");
    return;
  }

  const unitPrice = Math.max(...selectedFlavors.map(s => MENU[activeSize][s]));
  const item = {
    id: Date.now(),
    size: activeSize,
    flavors: [...selectedFlavors],
    price: unitPrice,
    text: selectedFlavors.length === 2 ? `1/2 ${selectedFlavors[0]} y 1/2 ${selectedFlavors[1]}` : selectedFlavors[0]
  };

  cart.push(item);
  selectedFlavors = []; 
  renderMenu();
  updateSummary();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateSummary();
}

/* ================= RESUMEN Y ENVÍO ================= */
function updateSummary() {
  const barrioKey = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value;
  const metodoPagoEl = document.getElementById("metodo-pago");
  const optEfectivo = document.getElementById("opt-efectivo");
  const orderBtn = document.getElementById("submit-order");
  const totalEl = document.getElementById("total-price");
  const cartList = document.getElementById("cart-list");
  const cartSummarySection = document.getElementById("cart-summary-section");
  const selectionText = document.getElementById("selection-text");

  // 1. RENDERIZAR LISTA DEL CARRITO
  if (cart.length > 0) {
    cartSummarySection.style.display = "block";
    cartList.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div>
          <strong>${item.size}</strong><br>
          <small>${item.text}</small>
        </div>
        <div style="text-align: right;">
          <span>$${item.price.toLocaleString()}</span><br>
          <button onclick="removeFromCart(${item.id})" class="btn-remove">✕ Borrar</button>
        </div>
      </div>
    `).join("");
  } else {
    cartSummarySection.style.display = "none";
    cartList.innerHTML = "";
  }

  // 2. ACTUALIZAR LABEL INFORMATIVO
  if (selectedFlavors.length > 0) {
    selectionText.textContent = `🍕 Seleccionando sabores (${selectedFlavors.length}/2)`;
  } else {
    selectionText.textContent = cart.length > 0 ? `✅ ${cart.length} pizza(s) en pedido` : "Pedido vacío";
  }

  // 3. RESTRICCIÓN DE EFECTIVO (SOLO BALCONES DEL MAR)
  if (barrioKey) {
    document.getElementById("payment-section").style.display = "block";
    
    if (barrioKey === "Balcones del Mar") {
      optEfectivo.style.display = "block";
      optEfectivo.disabled = false;
    } else {
      optEfectivo.style.display = "none";
      optEfectivo.disabled = true;
      // Si el usuario tenía Efectivo y cambia a otro barrio, resetear el pago
      if (metodoPagoEl.value === "Efectivo") metodoPagoEl.value = "";
    }
  } else {
    document.getElementById("payment-section").style.display = "none";
  }

  // 4. CÁLCULO DE TOTAL
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const domicilio = BARRIOS[barrioKey] || 0;
  totalEl.textContent = `$${(subtotal + domicilio).toLocaleString()}`;

  // 5. VALIDACIÓN FINAL DEL BOTÓN
  orderBtn.disabled = !(cart.length > 0 && barrioKey && direccion && metodoPagoEl.value);
}

function handleOrder() {
  const telefono = document.getElementById("telefono").value;
  const barrio = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value;
  const indicaciones = document.getElementById("indicaciones").value;
  const pagoKey = document.getElementById("metodo-pago").value;

  const listaPedido = cart.map(item => `• ${item.size}: ${item.text} ($${item.price.toLocaleString()})`).join("\n");
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const domicilio = BARRIOS[barrio] || 0;
  
  // Info detallada del pago para el mensaje
  const infoPago = CUENTAS_PAGO[pagoKey];
  const pagoDetalle = (pagoKey === "Nequi" || pagoKey === "Daviplata") 
    ? `${pagoKey} (Confirmar a: ${infoPago})` 
    : pagoKey;

  const msg = `
🍕 *NUEVO PEDIDO - USTARIZ PIZZA*
----------------------------------
📦 *Detalle:*
${listaPedido}

🏘️ *Barrio:* ${barrio}
📍 *Dirección:* ${direccion}
${indicaciones ? "ℹ️ *Notas:* " + indicaciones : ""}
💳 *Pago:* ${pagoDetalle}

💰 *Subtotal:* $${subtotal.toLocaleString()}
🛵 *Domicilio:* $${domicilio.toLocaleString()}
⭐ *TOTAL:* $${(subtotal + domicilio).toLocaleString()}

📞 *Contacto:* ${telefono}`.trim();

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Vinculación del botón Finalizar
document.getElementById("submit-order").onclick = () => {
  handleOrder();
};

/* ================= INIT ================= */
loadBarrios();
renderTabs();
renderMenu();