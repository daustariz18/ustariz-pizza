// Configuración inicial
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQLkl1w4TvpU7IJ-e9YBua9groAPcNr5kaIbSPIEmpcz0zc4awhrvlOupFmZn3utlCFg76s8-sDs-U4/pub?gid=1409126163&single=true&output=csv'; 
const VENTAS_API = 'https://script.google.com/macros/s/AKfycbz6RBG675V3g5H5mn4HuOIXPg0TQXPLjrYDSOCUiuB6a-KwTjGyud9_Iw9LGiqT68n2/exec';

let menuData = []; 
let selectedSabores = []; // Array para manejar los 1 o 2 sabores elegidos
let activeSize = "Personal"; 

// 1. Cargar datos del Menú
async function loadMenu() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1); 
        
        menuData = rows.map(row => {
            const cols = row.split(',');
            return {
                t: cols[0]?.trim(), // Tamaño
                s: cols[1]?.trim(), // Sabor
                p: parseInt(cols[2]) || 0, // Precio
                img: cols[3]?.trim()  // Ruta imagen (ej: img/Pollo.png)
            };
        });
        
        renderMenu();
    } catch (error) {
        console.error("Error cargando el menú:", error);
    }
}

// 2. Dibujar las Pizzas en el HTML
function renderMenu() {
    const grid = document.getElementById('menu-content');
    if (!grid) return;
    grid.innerHTML = ""; 

    const filteredPizzas = menuData.filter(pizza => pizza.t === activeSize);

    filteredPizzas.forEach(pizza => {
        const isSelected = selectedSabores.some(s => s.s === pizza.s);
        const card = document.createElement('div');
        card.className = `pizza-card ${isSelected ? 'selected' : ''}`;
        
        card.innerHTML = `
            <img src="${pizza.img}" class="pizza-img" onerror="this.src='img/logo.png'">
            <div class="pizza-info">
                <h3>${pizza.s}</h3>
                <span class="price">$${pizza.p.toLocaleString()}</span>
            </div>
        `;
        
        card.onclick = () => toggleSabor(pizza);
        grid.appendChild(card);
    });
}

// 3. Lógica de selección de sabores (Máximo 2)
function toggleSabor(pizza) {
    const index = selectedSabores.findIndex(s => s.s === pizza.s);

    if (index > -1) {
        selectedSabores.splice(index, 1); // Quitar si ya estaba
    } else {
        if (selectedSabores.length < 2) {
            selectedSabores.push(pizza); // Agregar si hay espacio
        } else {
            alert("Solo puedes seleccionar hasta 2 sabores");
        }
    }

    actualizarResumen();
    renderMenu();
}

// 4. Actualizar Precio Total (El de mayor valor)
function actualizarResumen() {
    const totalElement = document.getElementById('total-price');
    if (selectedSabores.length === 0) {
        totalElement.innerText = "$0";
        return;
    }

    // Lógica: se cobra el de mayor valor
    const precios = selectedSabores.map(s => s.p);
    const precioFinal = Math.max(...precios);
    
    totalElement.innerText = `$${precioFinal.toLocaleString()}`;
}

// 5. Enviar Pedido a Apps Script y WhatsApp
async function handleOrder() {
    const direccion = document.getElementById('direccion')?.value;
    
    if (!direccion || selectedSabores.length === 0) {
        alert("Por favor selecciona al menos un sabor y escribe tu dirección");
        return;
    }

    const total = Math.max(...selectedSabores.map(s => s.p));
    
    const datosParaEnvio = {
        tamaño: activeSize,
        sabores: selectedSabores.map(s => s.s),
        total: total,
        direccion: direccion,
        metodoPago: "WhatsApp" 
    };

    try {
        // Enviar a Google Sheets (Apps Script)
        fetch(VENTAS_API, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(datosParaEnvio)
        });

        // Formatear mensaje de WhatsApp
        const saboresText = selectedSabores.map(s => s.s).join(" y ");
        const mensaje = `🍕 *USTARIZ PIZZA*\n\n*Pedido:* ${activeSize} de ${saboresText}\n*Total:* $${total.toLocaleString()}\n*Dirección:* ${direccion}`;
        
        // Reemplaza TU_NUMERO por tu número real (ej: 573001234567)
        window.open(`https://wa.me/57TU_NUMERO?text=${encodeURIComponent(mensaje)}`);
    } catch (err) {
        console.error("Error al procesar el pedido:", err);
    }
}

// Iniciar
loadMenu();