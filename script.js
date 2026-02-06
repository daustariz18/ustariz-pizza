/*************************************************
 * CONFIGURACIÓN GENERAL
 *************************************************/

// 👉 URL de tu Apps Script (ventas)
const VENTAS_API = 'https://script.google.com/macros/s/AKfycbz6RBG675V3g5H5mn4HuOIXPg0TQXPLjrYDSOCUiuB6a-KwTjGyud9_Iw9LGiqT68n2/exec';

// 👉 Número de WhatsApp (formato internacional sin +)
const WHATSAPP_NUMBER = '573001234567'; // CAMBIA ESTE NÚMERO


/*************************************************
 * DICCIONARIO DE IMÁGENES
 *************************************************/
const IMAGES = {
  "Salami": "img/salami.png",
  "Jamon": "img/jamon.png",
  "Pollo": "img/pollo.png",
  "Pepperoni": "img/pepperoni.png",
  "Salami Pimenton": "img/salami-pimenton.png",
  "Hawaiana": "img/hawaiana.png",
  "Pollo Jamon": "img/jamon-pollo.png",
  "3 Carnes": "img/3-carnes.png"
};


/*************************************************
 * DICCIONARIO DE PRECIOS
 *************************************************/
const MENU = {
  "Personal": {
    "Salami": 20000,
    "Jamon": 20000,
    "Pollo": 20000,
    "Pepperoni": 20000,
    "Salami Pimenton": 20000,
    "Hawaiana": 20000,
    "Pollo Jamon": 20000,
    "3 Carnes": 22000
  },
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


/*************************************************
 * ESTADO DE LA APP
 *************************************************/
let activeSize = "Personal";
let selectedSabores = [];


/*************************************************
 * RENDER DEL MENÚ
 *************************************************/
function renderMenu() {
  const grid = document.getElementById("menu-content");
  if (!grid) return;

  grid.innerHTML = "";

  Object.entries(MENU[activeSize]).forEach(([sabor, precio]) => {
    const isSelected = selectedSabores.includes(sabor);

    const card = document.createElement("div");
    card.className = `pizza-card ${isSelected ? "selected" : ""}`;

    card.innerHTML = `
      <img src="${IMAGES[sabor]}" class="pizza-img" onerror="this.src='img/logo.png'">
      <div class="pizza-info">
        <h3>${sabor}</h3>
        <span class="price">$${precio.toLocaleString()}</span>
      </div>
    `;

    card.onclick = () => toggleSabor(sabor);
    grid.appendChild(card);
  });
}


/*************************************************
 * SELECCIÓN DE SABORES (máx 2)
 *************************************************/
function toggleSabor(sabor) {
  const index = selectedSabores.indexOf(sabor);

  if (index >= 0) {
    selectedSabores.splice(index, 1);
  } else {
    if (selectedSabores.length >= 2) {
      alert("Solo puedes seleccionar hasta 2 sabores");
      return;
    }
    selectedSabores.push(sabor);
  }

  actualizarResumen();
  renderMenu();
}


/*************************************************
 * ACTUALIZAR PRECIO (cobra el mayor)
 *************************************************/
function actualizarResumen() {
  const totalEl = document.getElementById("total-price");

  if (selectedSabores.length === 0) {
    totalEl.innerText = "$0";
    return;
  }

  const precios = selectedSabores.map(
    sabor => MENU[activeSize][sabor]
  );

  const total = Math.max(...precios);
  totalEl.innerText = `$${total.toLocaleString()}`;
}


/*************************************************
 * ENVIAR PEDIDO
 *************************************************/
async function handleOrder() {
  const direccion = document.getElementById("direccion")?.value;

  if (!direccion || selectedSabores.length === 0) {
    alert("Selecciona al menos un sabor y escribe tu dirección");
    return;
  }

  const precios = selectedSabores.map(
    sabor => MENU[activeSize][sabor]
  );
  const total = Math.max(...precios);

  const datosParaEnvio = {
    tamaño: activeSize,
    sabores: selectedSabores,
    total: total,
    direccion: direccion,
    metodoPago: "WhatsApp"
  };

  try {
    // 👉 Guardar en Google Sheets
    fetch(VENTAS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosParaEnvio)
    });

    // 👉 Mensaje WhatsApp
    const saboresText = selectedSabores.join(" y ");
    const mensaje =
      `🍕 *USTARIZ PIZZA*\n\n` +
      `*Pedido:* ${activeSize} de ${saboresText}\n` +
      `*Total:* $${total.toLocaleString()}\n` +
      `*Dirección:* ${direccion}`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
    );

  } catch (err) {
    console.error("Error al procesar el pedido:", err);
  }
}


/*************************************************
 * INICIALIZAR
 *************************************************/
renderMenu();
