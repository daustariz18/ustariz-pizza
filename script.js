const menuData = [
    { t: "Personal", s: "Salami", p: 20000, img: "salami.png" },
    { t: "Personal", s: "Jamon", p: 20000, img: "Jamon.png" },
    { t: "Personal", s: "Pollo", p: 20000, img: "Pollo.png" },
    { t: "Personal", s: "Pepperoni", p: 20000, img: "pepperoni.png" },
    { t: "Personal", s: "Salami Pimenton", p: 20000, img: "Salami-Pimenton.png" },
    { t: "Personal", s: "Hawaiana", p: 20000, img: "Hawaiana.png" },
    { t: "Personal", s: "Pollo Jamon", p: 20000, img: "Jamon-Pollo.png" },
    { t: "Personal", s: "3 Carnes", p: 22000, img: "3-Carnes.png" },
    // Para Small...
    { t: "Small", s: "Salami", p: 28000, img: "salami.png" },
    { t: "Small", s: "Pepperoni", p: 30000, img: "pepperoni.png" },
    { t: "Small", s: "3 Carnes", p: 32000, img: "3-Carnes.png" },
    // Añade el resto siguiendo este patrón
];

let selectedSabores = [];
let currentSize = "Personal";
const sizes = ["Personal", "Small", "Medium", "Large", "X-Large"];

function init() {
    const tabs = document.getElementById('tabs-bar');
    sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${size === currentSize ? 'active' : ''}`;
        btn.innerText = size;
        btn.onclick = () => changeSize(size, btn);
        tabs.appendChild(btn);
    });
    renderMenu();
    document.getElementById('direccion').value = localStorage.getItem('user_dir') || "";
}

function changeSize(size, btn) {
    currentSize = size;
    selectedSabores = []; // Reset al cambiar tamaño
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    updateCartUI();
    renderMenu();
}

function renderMenu() {
    const grid = document.getElementById('menu-content');
    grid.innerHTML = "";
    
    menuData.filter(item => item.t === currentSize).forEach(pizza => {
        const isSelected = selectedSabores.find(s => s.s === pizza.s);
        const card = document.createElement('div');
        card.className = `pizza-card ${isSelected ? 'selected' : ''}`;
        card.innerHTML = `
            <img src="img/${pizza.img}" class="pizza-img" onerror="this.src='img/logo.png'">
            <div class="pizza-info">
                <h3>${pizza.s}</h3>
                <span class="price">$${pizza.p.toLocaleString()}</span>
            </div>
        `;
        card.onclick = () => selectSabor(pizza);
        grid.appendChild(card);
    });
}

function selectSabor(pizza) {
    const index = selectedSabores.findIndex(s => s.s === pizza.s);
    if (index > -1) {
        selectedSabores.splice(index, 1);
    } else if (selectedSabores.length < 2) {
        selectedSabores.push(pizza);
    }
    updateCartUI();
    renderMenu();
}

function updateCartUI() {
    const count = selectedSabores.length;
    // REGLA: Cobrar el valor más alto
    const total = count > 0 ? Math.max(...selectedSabores.map(s => s.p)) : 0;
    
    document.getElementById('selection-text').innerText = `${count}/2 sabores`;
    document.getElementById('total-price').innerText = `$${total.toLocaleString()}`;
    document.getElementById('submit-order').disabled = count === 0;
}

function handleOrder() {
    const dir = document.getElementById('direccion').value;
    if (!dir) return alert("Por favor, ingresa tu dirección.");
    
    localStorage.setItem('user_dir', dir);
    const total = Math.max(...selectedSabores.map(s => s.p));
    const sabores = selectedSabores.map(s => s.s).join(" con ");
    
    const mensaje = `🍕 *USTARIZ PIZZA - NUEVO PEDIDO*\n\n` +
                    `• *Tamaño:* ${currentSize}\n` +
                    `• *Sabores:* ${sabores}\n` +
                    `• *Total:* $${total.toLocaleString()}\n\n` +
                    `📍 *Entrega:* ${dir}`;
    
    window.open(`https://wa.me/573000000000?text=${encodeURIComponent(mensaje)}`); // <--- Cambia tu número aquí
}

init();