/* ================= CONEXIÓN CON FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPtNqWL8auMiWfu3rNA992MWSFZVhVSbc",
  authDomain: "ustariz-pizza.firebaseapp.com",
  databaseURL: "https://ustariz-pizza-default-rtdb.firebaseio.com",
  projectId: "ustariz-pizza",
  storageBucket: "ustariz-pizza.firebasestorage.app",
  messagingSenderId: "1016949121809",
  appId: "1:1016949121809:web:b197ca9e34d263942f22b0",
  measurementId: "G-DWL8WKFQJD"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ================= CONTROL OPERATIVO REMOTO ================= */
const CONFIG_SISTEMA = {
  HORA_APERTURA: 12,
  HORA_CIERRE: 22,
  estadoRemoto: {
    appEncendida: true,
    saboresAgotados: [] 
  }
};

// Escuchar cambios desde el Panel de Administrador en tiempo real
onValue(ref(db, 'configuracion'), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    CONFIG_SISTEMA.estadoRemoto.appEncendida = data.appEncendida;
    CONFIG_SISTEMA.estadoRemoto.saboresAgotados = data.saboresAgotados || [];
    
    // Cada vez que cambie algo en el admin, refrescamos la interfaz del cliente
    updateUI();
  }
});

/* ================= DATOS DEL MENÚ ================= */
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

/* ================= ESTADO APP ================= */
let activeSize = "Small";
let selectedFlavors = [];
let cart = [];

/* ================= FUNCIONES CORE ================= */

function verificarHorario() {
  const hora = new Date().getHours();
  return hora >= CONFIG_SISTEMA.HORA_APERTURA && hora < CONFIG_SISTEMA.HORA_CIERRE;
}

function sistemaAbierto() {
  return verificarHorario() && CONFIG_SISTEMA.estadoRemoto.appEncendida;
}

function renderMenu() {
  const grid = document.getElementById("menu-content");
  if (!grid) return;
  grid.innerHTML = "";
  let visibles = 0;

  Object.entries(MENU[activeSize]).forEach(([sabor, precio]) => {
    // FILTRADO DINÁMICO: Si el admin lo marcó como agotado, desaparece del menú
    const estaAgotado = CONFIG_SISTEMA.estadoRemoto.saboresAgotados.includes(sabor);
    if (estaAgotado) return;

    const card = document.createElement("div");
    card.className = `pizza-card ${selectedFlavors.includes(sabor) ? "selected" : ""}`;
    card.innerHTML = `
      <div class="pizza-image">
        <img src="${IMAGES[sabor]}" alt="${sabor}" onerror="this.src='img/logo.png'">
        <div class="overlay"><h3>${sabor}</h3><span>$${precio.toLocaleString()}</span></div>
      </div>`;
    card.onclick = () => toggleFlavor(sabor);
    grid.appendChild(card);
    visibles += 1;
  });

  if (visibles === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; background: var(--card); border: 1px solid var(--gray-border); border-radius: 12px;">No hay sabores disponibles por el momento.</div>`;
  }
  updateAddButton();
}

async function updateUI() {
  // 1. Verificar Disponibilidad General
  const dentroHorario = verificarHorario();
  const appEncendida = CONFIG_SISTEMA.estadoRemoto.appEncendida;
  const abierta = sistemaAbierto();
  
  const orderBtn = document.getElementById("submit-order");
  const addBtn = document.getElementById("add-to-cart-btn");
  const statusMsg = document.getElementById("sistema-status-msg");
  const floatingAlert = document.getElementById("horario-floating-alert");

  // Asegurar render de elementos visuales aunque falte algún nodo del footer
  renderTabs();
  renderMenu();
  if (!orderBtn || !addBtn) return;

  const horarioTexto = `Nuestro horario es de ${formatHour24To12(CONFIG_SISTEMA.HORA_APERTURA)} a ${formatHour24To12(CONFIG_SISTEMA.HORA_CIERRE)}.`;

  if (floatingAlert) {
    floatingAlert.textContent = `⚠️ Estamos por fuera del horario de atención. ${horarioTexto}`;
    floatingAlert.style.display = dentroHorario ? "none" : "block";
  }
  
  if (!abierta) {
    const isForceClosed = appEncendida === false;
    const msg = isForceClosed ? "CERRADO POR FUERZA MAYOR" : "FUERA DE HORARIO";
    orderBtn.disabled = true;
    orderBtn.textContent = msg;
    orderBtn.style.background = "#444";
    addBtn.disabled = true;
    addBtn.textContent = "SISTEMA CERRADO";

    if (statusMsg) {
      statusMsg.style.display = "block";
      statusMsg.innerHTML = `⚠️ <strong>¡Lo sentimos!</strong> En este momento no estamos recibiendo pedidos. ${isForceClosed ? "Vuelve pronto." : horarioTexto}`;
    }
  } else {
    orderBtn.textContent = "ENVIAR PEDIDO POR WHATSAPP";
    orderBtn.style.background = "";
    addBtn.textContent = "Añadir al pedido";
    updateOrderButton();
    updateAddButton();
    if (statusMsg) statusMsg.style.display = "none";
    hideHorarioModal();
  }

  // 2. Renderizar componentes normales
  updateCartList();
  updateSelectionText();
  updateSummary();
}

/* ================= EL RESTO DE TUS FUNCIONES (TOAST, CART, ETC) ================= */

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  let icon = "ℹ";
  if (type === "success") icon = "✓";
  if (type === "error") icon = "✕";
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
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

function addToCart() {
  if (!sistemaAbierto()) {
    showToast("El sistema está cerrado en este momento", "error");
    updateAddButton();
    return;
  }

  if (selectedFlavors.length === 0) return;
  const unitPrice = Math.max(...selectedFlavors.map(s => MENU[activeSize][s]));
  const item = {
    id: Date.now(),
    size: activeSize,
    flavors: [...selectedFlavors],
    price: unitPrice,
    text: selectedFlavors.length === 2 ? `1/2 ${selectedFlavors[0]} y 1/2 ${selectedFlavors[1]}` : selectedFlavors[0]
  };
  cart.push(item);
  showToast(`🍕 Pizza ${item.size} agregada`, "success");
  selectedFlavors = []; 
  updateUI();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateUI();
}

function updateCartList() {
  const cartList = document.getElementById("cart-list");
  const section = document.getElementById("cart-summary-section");
  if (cart.length > 0) {
    section.style.display = "block";
    cartList.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div><strong>${item.size}</strong><br><small>${item.text}</small></div>
        <div style="text-align: right;">
          <span>$${item.price.toLocaleString()}</span><br>
          <button onclick="removeFromCart(${item.id})" class="btn-remove">✕ Borrar</button>
        </div>
      </div>`).join("");
  } else {
    section.style.display = "none";
  }
}

function renderTabs() {
  const tabs = document.getElementById("tabs-bar");
  const recoLabel = document.getElementById("size-recommendation-label");
  tabs.innerHTML = "";
  recoLabel.innerHTML = `👥 ${RECO_MESSAGES[activeSize]}`;
  Object.keys(MENU).forEach(size => {
    const btn = document.createElement("button");
    btn.className = `tab-btn ${size === activeSize ? "active" : ""}`;
    const info = SIZE_INFO[size];
    btn.innerHTML = `<span class="size-name">${size}</span><span class="size-info">${info.portions} Porc. - ${info.diameter}</span>`;
    btn.onclick = () => { activeSize = size; selectedFlavors = []; updateUI(); };
    tabs.appendChild(btn);
  });
}

function validatePhone(phone) {
  const cleaned = phone.replaceAll(/\D/g, "");
  return cleaned.length === 10 && /^3\d{9}$/.test(cleaned);
}

function validateForm() {
  const telefono = document.getElementById("telefono");
  const direccion = document.getElementById("direccion_principal");
  let valid = true;
  const telefonoValido = validatePhone(telefono.value);
  if (telefonoValido === false) {
    telefono.classList.add("invalid");
    valid = false;
  } else {
    telefono.classList.remove("invalid");
  }
  if (direccion.value.trim().length < 10) {
    direccion.classList.add("invalid");
    valid = false;
  } else {
    direccion.classList.remove("invalid");
  }
  return valid;
}

function updateOrderButton() {
  const orderBtn = document.getElementById("submit-order");
  const barrio = document.getElementById("barrio").value;
  const tel = document.getElementById("telefono").value;
  const dir = document.getElementById("direccion_principal").value;
  const pago = document.getElementById("metodo-pago").value;

  const abierta = sistemaAbierto();
  orderBtn.disabled = !(cart.length > 0 && barrio && validatePhone(tel) && dir.length >= 10 && pago && abierta);
}

function handleOrder() {
  if (!validateForm()) return;
  const pagoKey = document.getElementById("metodo-pago").value;
  if ((pagoKey === "Nequi" || pagoKey === "Daviplata") && !confirm("⚠️ ¿Confirmas que enviarás el comprobante por WhatsApp?")) return;

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const domicilio = BARRIOS[document.getElementById("barrio").value] || 0;
  const lista = cart.map(i => `• ${i.size}: ${i.text}`).join("\n");
  
  const msg = `🍕 *NUEVO PEDIDO - USTARIZ PIZZA*\n\n${lista}\n\n📍 *Dirección:* ${document.getElementById("direccion_principal").value}\n🏘️ *Barrio:* ${document.getElementById("barrio").value}\n💳 *Pago:* ${pagoKey}\n⭐ *TOTAL:* $${(subtotal + domicilio).toLocaleString()}`;
  
  globalThis.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ================= FUNCIONES DE APOYO UI ================= */
function formatHour24To12(h) {
  if (h === 0) return "12:00 AM";
  if (h === 12) return "12:00 PM";
  return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
}
function hideHorarioModal() { document.getElementById("horario-modal").style.display = "none"; document.body.style.overflow = ""; }
function updateSelectionText() {
  const selection = document.getElementById("selection-text");
  if (selectedFlavors.length > 0) {
    selection.textContent = `🍕 Sabores (${selectedFlavors.length}/2)`;
    return;
  }
  if (cart.length > 0) {
    selection.textContent = `✅ ${cart.length} pizza(s)`;
    return;
  }
  selection.textContent = "Pedido vacío";
}
function updatePaymentSection() { document.getElementById("payment-section").style.display = document.getElementById("barrio").value ? "block" : "none"; }
function updatePaymentInfo() {
  const paymentInfo = document.getElementById("payment-info");
  const metodo = document.getElementById("metodo-pago").value;

  if (!metodo || metodo === "Efectivo") {
    paymentInfo.style.display = "none";
    paymentInfo.textContent = "";
    return;
  }

  const cuenta = CUENTAS_PAGO[metodo];
  paymentInfo.style.display = "block";
  paymentInfo.textContent = `Número ${metodo}: ${cuenta}. Envía el comprobante por WhatsApp.`;
}
function updateTotal() {
  const domi = BARRIOS[document.getElementById("barrio").value] || 0;
  const sub = cart.reduce((a, b) => a + b.price, 0);
  document.getElementById("total-price").textContent = `$${(sub + domi).toLocaleString()}`;
}
function updateSummary() {
  updatePaymentSection();
  updatePaymentInfo();
  updateTotal();
  updateOrderButton();
}
function updateAddButton() {
  const addBtn = document.getElementById("add-to-cart-btn");
  const abierta = sistemaAbierto();
  addBtn.disabled = selectedFlavors.length === 0 || abierta === false;
}
function loadBarrios() {
  const sel = document.getElementById("barrio");
  Object.entries(BARRIOS).forEach(([b, v]) => {
    const opt = document.createElement("option");
    opt.value = b; opt.textContent = `${b} (+$${v.toLocaleString()})`; sel.appendChild(opt);
  });
}

// Global para los botones del HTML
globalThis.removeFromCart = removeFromCart;
globalThis.updateSummary = updateSummary;

/* ================= INICIALIZACIÓN ================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-to-cart-btn").addEventListener("click", addToCart);
  document.getElementById("submit-order").addEventListener("click", handleOrder);
  document.getElementById("telefono").addEventListener("input", (e) => { e.target.value = e.target.value.replaceAll(/\D/g, ""); updateSummary(); });
  document.getElementById("barrio").addEventListener("change", updateSummary);
  document.getElementById("metodo-pago").addEventListener("change", updateSummary);
  document.getElementById("direccion_principal").addEventListener("input", updateSummary);
  document.getElementById("close-horario-modal").addEventListener("click", hideHorarioModal);
  
  loadBarrios();
  updateUI();
  setInterval(updateUI, 30000);
  globalThis.addEventListener("focus", updateUI);
});