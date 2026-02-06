// URL de tu Google Sheet publicada como CSV
const CSV_URL = 'ESCRIBE_AQUÍ_TU_URL_DE_GOOGLE_SHEETS'; 

let menuData = []; // Aquí guardaremos todo el menú
let activeSize = "Personal"; // Tamaño por defecto

async function loadMenu() {
    try {
        const response = await fetch(CSV_URL);
        const data = await response.text();
        // Separamos por líneas y saltamos el encabezado
        const rows = data.split('\n').slice(1); 
        
        menuData = rows.map(row => {
            const cols = row.split(',');
            return {
                t: cols[0]?.trim(), // Tamaño (Personal, Small, etc.)
                s: cols[1]?.trim(), // Sabor (3 Carnes, Hawaiana, etc.)
                p: parseInt(cols[2]), // Precio
                img: cols[3]?.trim()  // Ruta de imagen (ej: img/3-Carnes.png)
            };
        });
        
        renderMenu(); // Dibujar las pizzas
    } catch (error) {
        console.error("Error cargando el menú:", error);
    }
}

function renderMenu() {
    const grid = document.getElementById('menu-content');
    grid.innerHTML = ""; // Limpiar antes de dibujar

    // Filtramos para mostrar solo las del tamaño activo
    const filteredPizzas = menuData.filter(pizza => pizza.t === activeSize);

    filteredPizzas.forEach(pizza => {
        const card = document.createElement('div');
        card.className = 'pizza-card';
        
        // Estructura de la tarjeta usando tus archivos locales
        card.innerHTML = `
            <img src="${pizza.img}" class="pizza-img" onerror="this.src='img/logo.png'">
            <div class="pizza-info">
                <h3>${pizza.s}</h3>
                <span class="price">$${pizza.p.toLocaleString()}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Iniciar la carga al abrir la página
loadMenu();

async function handleOrder() {
    const direccion = document.getElementById('direccion').value;
    const total = Math.max(...selectedSabores.map(s => s.p));
    
    // Este objeto DEBE coincidir con lo que lee tu Apps Script (data.sabores, data.tamaño, etc)
    const datosParaEnvio = {
        tamaño: activeSize,
        sabores: selectedSabores.map(s => s.s), // Envía un Array
        total: total,
        direccion: direccion,
        metodoPago: "WhatsApp" 
    };

    // 1. Enviar a Google Sheets
    fetch('https://script.google.com/macros/s/AKfycbz6RBG675V3g5H5mn4HuOIXPg0TQXPLjrYDSOCUiuB6a-KwTjGyud9_Iw9LGiqT68n2/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(datosParaEnvio)
    });

    // 2. Formatear mensaje de WhatsApp
    const saboresText = selectedSabores.map(s => s.s).join(" y ");
    const mensaje = `🍕 *USTARIZ PIZZA*\n\nPedido: ${activeSize} de ${saboresText}\nTotal: $${total}\nDirección: ${direccion}`;
    
    window.open(`https://wa.me/57TU_NUMERO?text=${encodeURIComponent(mensaje)}`);
}