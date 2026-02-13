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

const SIZE_INFO = {
  "Small": { portions: 8, diameter: "26cm" },
  "Medium": { portions: 8, diameter: "30cm" },
  "Large": { portions: 8, diameter: "35cm" },
  "X-Large": { portions: 10, diameter: "40cm" },
  "Familiar": { portions: 12, diameter: "50cm" }
};

const IMAGES = {
  "Salami": "img/salami.png", "Jamon": "img/Jamon.png", "Pollo": "img/Pollo.png",
  "Pepperoni": "img/pepperoni.png", "Salami Pimenton": "img/Salami-Pimenton.png",
  "Hawaiana": "img/Hawaiana.png", "Pollo Jamon": "img/Jamon-Pollo.png", "3 Carnes": "img/3-Carnes.jpeg"
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

/* ================= UTILIDADES ================= */
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 && /^3\d{9}$/.test(cleaned);
}

function validateForm() {
  let isValid = true;
  
  const telefono = document.getElementById("telefono");
  const telefonoError = document.getElementById("telefono-error");
  const direccion = document.getElementById("direccion_principal");
  const direccionError = document.getElementById("direccion-error");
  
  // Validar teléfono
  if (!telefono.value.trim()) {
    telefonoError.textContent = "El teléfono es obligatorio";
    telefono.classList.add("invalid");
    isValid = false;
  } else if (!validatePhone(telefono.value)) {
    telefonoError.textContent = "Ingresa un número válido de 10 dígitos (debe empezar con 3)";
    telefono.classList.add("invalid");
    isValid = false;
  } else {
    telefonoError.textContent = "";
    telefono.classList.remove("invalid");
  }
  
  // Validar dirección
  if (!direccion.value.trim()) {
    direccionError.textContent = "La dirección es obligatoria";
    direccion.classList.add("invalid");
    isValid = false;
  } else if (direccion.value.trim().length < 10) {
    direccionError.textContent = "La dirección debe ser más específica";
    direccion.classList.add("invalid");
    isValid = false;
  } else {
    direccionError.textContent = "";
    direccion.classList.remove("invalid");
  }
  
  return isValid;
}

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
    
    const info = SIZE_INFO[size];
    const infoExtra = `(${info.portions} Porciones) - ${info.diameter}`;
    
    btn.innerHTML = `<span class="size-name">${size}</span><span class="size-info">${infoExtra}</span>`;
    btn.onclick = () => {
      activeSize = size;
      selectedFlavors = [];
      updateUI();
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
  
  updateAddButton();
}

function updateAddButton() {
  const addBtn = document.getElementById("add-to-cart-btn");
  addBtn.disabled = selectedFlavors.length === 0;
}

function toggleFlavor(sabor) {
  if (selectedFlavors.includes(sabor)) {
    selectedFlavors = selectedFlavors.filter(s => s !== sabor);
  } else {
    if (selectedFlavors.length === 2) {
      showToast("Solo puedes elegir hasta 2 sabores", "error");
      return;
    }
    selectedFlavors.push(sabor);
  }
  renderMenu();
  updateSelectionText();
}

/* ================= LÓGICA DE CARRITO ================= */
function addToCart() {
  if (selectedFlavors.length === 0) {
    showToast("Selecciona al menos 1 sabor", "error");
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
  
  // Feedback visual
  showToast(`🍕 Pizza ${item.size} agregada al pedido`, "success");
  
  // Reset selección
  selectedFlavors = []; 
  updateUI();
  
  // Scroll suave hacia el carrito
  document.getElementById("cart-summary-section").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  if (item && confirm(`¿Eliminar pizza ${item.size} del pedido?`)) {
    cart = cart.filter(i => i.id !== id);
    showToast("Pizza eliminada del pedido", "error");
    updateUI();
  }
}

/* ================= RESUMEN Y ENVÍO ================= */
function updateCartList() {
  const cartList = document.getElementById("cart-list");
  const cartSummarySection = document.getElementById("cart-summary-section");
  
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
}

function updateSelectionText() {
  const selectionText = document.getElementById("selection-text");
  
  if (selectedFlavors.length > 0) {
    selectionText.textContent = `🍕 Seleccionando sabores (${selectedFlavors.length}/2)`;
  } else {
    selectionText.textContent = cart.length > 0 ? `✅ ${cart.length} pizza(s) en pedido` : "Pedido vacío";
  }
}

function updatePaymentSection() {
  const barrioKey = document.getElementById("barrio").value;
  const metodoPagoEl = document.getElementById("metodo-pago");
  const optEfectivo = document.getElementById("opt-efectivo");
  
  if (barrioKey) {
    document.getElementById("payment-section").style.display = "block";
    
    if (barrioKey === "Balcones del Mar") {
      optEfectivo.style.display = "block";
      optEfectivo.disabled = false;
    } else {
      optEfectivo.style.display = "none";
      optEfectivo.disabled = true;
      if (metodoPagoEl.value === "Efectivo") metodoPagoEl.value = "";
    }
  } else {
    document.getElementById("payment-section").style.display = "none";
  }
}

function updateTotal() {
  const barrioKey = document.getElementById("barrio").value;
  const totalEl = document.getElementById("total-price");
  
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const domicilio = BARRIOS[barrioKey] || 0;
  totalEl.textContent = `$${(subtotal + domicilio).toLocaleString()}`;
}

function updateOrderButton() {
  const barrioKey = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const metodoPagoEl = document.getElementById("metodo-pago").value;
  const orderBtn = document.getElementById("submit-order");
  
  const hasValidPhone = validatePhone(telefono);
  const hasValidAddress = direccion.length >= 10;
  
  orderBtn.disabled = !(
    cart.length > 0 && 
    barrioKey && 
    hasValidPhone && 
    hasValidAddress && 
    metodoPagoEl
  );
}

function updateUI() {
  updateCartList();
  updateSelectionText();
  updatePaymentSection();
  updateTotal();
  updateOrderButton();
  renderTabs();
  renderMenu();
}

function handleOrder() {
  if (!validateForm()) {
    showToast("Por favor corrige los errores del formulario", "error");
    return;
  }

  const telefono = document.getElementById("telefono").value;
  const barrio = document.getElementById("barrio").value;
  const direccion = document.getElementById("direccion_principal").value;
  const indicaciones = document.getElementById("indicaciones").value;
  const pagoKey = document.getElementById("metodo-pago").value;

  // NUEVA ALERTA DE COMPROBANTE
  if (pagoKey === "Nequi" || pagoKey === "Daviplata") {
    const confirmar = confirm("⚠️ RECUERDA: Para iniciar la preparación de tu pizza, debes adjuntar el COMPROBANTE DE PAGO (pantallazo) una vez se abra el chat de WhatsApp. ¿Deseas continuar?");
    if (!confirmar) return;
  }

  const listaPedido = cart.map(item => `• ${item.size}: ${item.text} ($${item.price.toLocaleString()})`).join("\n");
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const domicilio = BARRIOS[barrio] || 0;
  
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

📞 *Contacto:* ${telefono}

---
⚠️ *Adjunto el comprobante de pago a continuación:*`.trim();

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  showToast("Abriendo WhatsApp...", "success");
}

/* ================= EVENT LISTENERS ================= */
document.addEventListener("DOMContentLoaded", () => {
  // Botón añadir al carrito
  document.getElementById("add-to-cart-btn").addEventListener("click", addToCart);
  
  // Botón enviar pedido
  document.getElementById("submit-order").addEventListener("click", handleOrder);
  
  // Validación en tiempo real
  const telefono = document.getElementById("telefono");
  const direccion = document.getElementById("direccion_principal");
  const barrio = document.getElementById("barrio");
  const metodoPago = document.getElementById("metodo-pago");
  
  telefono.addEventListener("input", () => {
    // Solo permitir números
    telefono.value = telefono.value.replace(/\D/g, "");
    updateOrderButton();
  });
  
  telefono.addEventListener("blur", validateForm);
  direccion.addEventListener("input", updateOrderButton);
  direccion.addEventListener("blur", validateForm);
  barrio.addEventListener("change", updateUI);
  metodoPago.addEventListener("change", updateOrderButton);
  
  // Inicialización
  loadBarrios();
  updateUI();
});