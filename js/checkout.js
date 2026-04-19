import { db } from "/firebase/credentials.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const productosMaster = [
    { id: 1, nombre: "Producto Alpha", precio: 25000, categoria: "premium", tag: "nuevo", imagen: "img1.png", descripcion: "Diseño minimalista con acabados de alta calidad." },
    { id: 2, nombre: "Producto Beta", precio: 40000, categoria: "novedades", tag: "", imagen: "img2.png", descripcion: "Innovación tecnológica avanzada integrada." },
    { id: 3, nombre: "Producto Gamma", precio: 55000, categoria: "premium", tag: "premium", imagen: "img3.png", descripcion: "Rendimiento superior diseñado para exigentes." },
    { id: 4, nombre: "Producto Delta", precio: 15000, categoria: "ofertas", tag: "", imagen: "img4.png", descripcion: "La mejor relación calidad-precio del mercado." },
     { id: 5, nombre: "Producto Delta", precio: 15000, categoria: "ofertas", tag: "", imagen: "img4.png", descripcion: "La mejor relación calidad-precio del mercado." },
      { id: 6, nombre: "Producto Delta", precio: 15000, categoria: "ofertas", tag: "", imagen: "img4.png", descripcion: "La mejor relación calidad-precio del mercado." }
];

let carrito = [];
let descuentoActivo = 0;

function cargarCarritoDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const itemsParam = params.get('items');

    if (itemsParam) {
        const ids = itemsParam.split(',').map(id => parseInt(id));
        carrito = ids.map(id => productosMaster.find(p => p.id === id)).filter(p => p !== undefined);
        localStorage.setItem('cart_data', JSON.stringify(carrito));
    } else {
        carrito = JSON.parse(localStorage.getItem('cart_data')) || [];
    }
}

function renderCheckout() {
    const list = document.getElementById('checkout-list');
    if (!list) return;

    if (carrito.length === 0) {
        list.innerHTML = `<p class="text-gray-500 italic text-center py-10">No hay productos seleccionados.</p>`;
        updateTotals();
        return;
    }

    list.innerHTML = carrito.map((item, index) => `
        <div class="flex items-center gap-6 bg-gray-900/40 border border-white/5 p-6 rounded-3xl group animate-fade-in">
            <div class="w-24 h-24 bg-gray-800 rounded-2xl overflow-hidden flex-shrink-0">
                <img src="/assets/catalog/${item.imagen}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <span class="text-green-500 text-[9px] font-black uppercase tracking-widest">${item.categoria}</span>
                <h3 class="text-white font-bold text-lg">${item.nombre}</h3>
                <p class="text-gray-500 text-xs line-clamp-1">${item.descripcion}</p>
            </div>
            <div class="text-right">
                <p class="text-white font-black mb-2">$${item.precio.toLocaleString()}</p>
                <button onclick="removeItem(${index})" class="text-red-500/30 hover:text-red-500 p-2 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
        </div>
    `).join('');
    updateTotals();
}

window.removeItem = (index) => {
    carrito.splice(index, 1);
    localStorage.setItem('cart_data', JSON.stringify(carrito));
    
    const newIds = carrito.map(p => p.id).join(',');
    const newURL = carrito.length > 0 ? `?items=${newIds}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
    
    renderCheckout();
};

function updateTotals() {
    const subtotal = carrito.reduce((sum, p) => sum + p.precio, 0);
    const montoDescuento = subtotal * (descuentoActivo / 100);
    const total = subtotal - montoDescuento;

    document.getElementById('subtotal').innerText = `$${subtotal.toLocaleString()}`;
    document.getElementById('total-price').innerText = `$${total.toLocaleString()}`;
    
    const discRow = document.getElementById('discount-row');
    if (descuentoActivo > 0) {
        discRow.classList.remove('hidden');
        document.getElementById('discount-amount').innerText = `-${descuentoActivo}% (-$${montoDescuento.toLocaleString()})`;
    } else {
        discRow.classList.add('hidden');
    }
}

document.getElementById('apply-promo')?.addEventListener('click', async () => {
    const codeInput = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    
    if (!codeInput) return;

    try {
        const q = query(collection(db, "codes"), where("name", "==", codeInput));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            descuentoActivo = data.value;
            msg.innerText = "CÓDIGO APLICADO";
            msg.className = "text-[10px] mt-2 uppercase tracking-widest text-green-500 font-bold";
            updateTotals();
        } else {
            descuentoActivo = 0;
            msg.innerText = "CÓDIGO INVÁLIDO";
            msg.className = "text-[10px] mt-2 uppercase tracking-widest text-red-500 font-bold";
            updateTotals();
        }
    } catch (e) {
        console.error(e);
    }
});

window.processPayment = () => {
    if (carrito.length === 0) return;

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const transactionId = `TX-${timestamp}-${randomStr}`;

    const subtotal = carrito.reduce((sum, p) => sum + p.precio, 0);
    const total = subtotal - (subtotal * (descuentoActivo / 100));

    const checkoutSession = {
        id: transactionId,
        items: carrito,
        total: total,
        descuento: descuentoActivo
    };

    localStorage.setItem('pending_payment', JSON.stringify(checkoutSession));

    window.location.href = `/cart/payment/?order=${transactionId}`;
};

document.addEventListener('DOMContentLoaded', () => {
    cargarCarritoDesdeURL();
    renderCheckout();
});