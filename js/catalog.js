import { db } from "/firebase/credentials.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const productosIniciales = [
    { 
        id: 1, 
        nombre: "Producto Alpha", 
        precio: 25000, 
        categoria: "premium", 
        tag: "nuevo", 
        imagen: "img1.png",
        descripcion: "Diseño minimalista con acabados de alta calidad para máxima durabilidad."
    },
    { 
        id: 2, 
        nombre: "Producto Beta", 
        precio: 40000, 
        categoria: "novedades", 
        tag: "", 
        imagen: "img2.png",
        descripcion: "Innovación tecnológica avanzada integrada en un formato compacto y elegante."
    },
    { 
        id: 3, 
        nombre: "Producto Gamma", 
        precio: 55000, 
        categoria: "premium", 
        tag: "premium", 
        imagen: "img3.png",
        descripcion: "Rendimiento superior diseñado para los usuarios más exigentes del mercado."
    },
    { 
        id: 4, 
        nombre: "Producto Delta", 
        precio: 15000, 
        categoria: "ofertas", 
        tag: "", 
        imagen: "img4.png",
        descripcion: "La mejor relación calidad-precio sin comprometer la eficiencia del producto."
    },
    { 
        id: 5, 
        nombre: "Producto Delta", 
        precio: 15000, 
        categoria: "ofertas", 
        tag: "", 
        imagen: "img4.png",
        descripcion: "La mejor relación calidad-precio sin comprometer la eficiencia del producto."
    },
    { 
        id: 6, 
        nombre: "Producto Delta", 
        precio: 15000, 
        categoria: "ofertas", 
        tag: "", 
        imagen: "img4.png",
        descripcion: "La mejor relación calidad-precio sin comprometer la eficiencia del producto."
    }
];

let productos = [...productosIniciales];
let carrito = JSON.parse(localStorage.getItem('cart_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderProducts(productos);
    updateCartUI();

    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = productos.filter(p => p.nombre.toLowerCase().includes(term));
            renderProducts(filtered);
        });
    }
});

function renderProducts(items) {
    const container = document.getElementById('products-grid');
    if(!container) return;

    container.innerHTML = items.map(p => {
        const imagePath = p.imagen ? `/assets/catalog/${p.imagen}` : null;
        
        return `
        <div class="group bg-gray-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-green-500/50 transition-all duration-500 animate-fade-in relative">
            <div class="aspect-square bg-gray-800 relative flex items-center justify-center overflow-hidden">
                ${imagePath 
                    ? `<img src="${imagePath}" onerror="this.parentElement.innerHTML='<span class=\'italic text-gray-700\'>Preview ${p.id}</span>'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">`
                    : `<span class="italic text-gray-700">Preview ${p.id}</span>`
                }
                ${p.tag ? `<div class="absolute top-4 left-4 bg-green-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase">${p.tag}</div>` : ''}
            </div>
            
            <div class="p-6">
                <span class="text-green-500 text-[9px] font-black uppercase tracking-widest">${p.categoria}</span>
                <h3 class="text-white font-bold text-lg mt-1">${p.nombre}</h3>
                <p class="text-gray-500 text-xs mt-2 leading-relaxed line-clamp-2">${p.descripcion}</p>
                <div class="mt-6 flex justify-between items-center">
                    <span class="text-white font-black">$${p.precio.toLocaleString()}</span>
                    <button onclick="addToCart(${p.id})" class="bg-white/5 hover:bg-green-600 p-3 rounded-2xl transition-all group/btn">
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

window.addToCart = (id) => {
    const prod = productos.find(p => p.id === id);
    if(!prod) return;
    carrito.push(prod);
    localStorage.setItem('cart_data', JSON.stringify(carrito));
    updateCartUI();
    
    const cartBtn = document.getElementById('cart-floating-btn');
    if(cartBtn) {
        cartBtn.classList.add('animate-bounce-short', 'border-green-400');
        setTimeout(() => cartBtn.classList.remove('animate-bounce-short', 'border-green-400'), 500);
    }
};

window.removeFromCart = (index) => {
    carrito.splice(index, 1);
    localStorage.setItem('cart_data', JSON.stringify(carrito));
    updateCartUI();
};

function updateCartUI() {
    const count = document.getElementById('cart-count');
    const list = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    if(count) count.innerText = carrito.length;
    if(list) {
        list.innerHTML = carrito.map((item, index) => `
            <div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl mb-2 border border-white/5 group/item">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-[8px] overflow-hidden">
                        ${item.imagen ? `<img src="/assets/catalog/${item.imagen}" class="w-full h-full object-cover">` : 'IMG'}
                    </div>
                    <div>
                        <p class="text-white font-bold text-sm">${item.nombre}</p>
                        <p class="text-green-500 text-xs">$${item.precio.toLocaleString()}</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-red-500 p-2 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
        `).join('');
    }
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    if(totalEl) totalEl.innerText = `$${total.toLocaleString()}`;
}

window.goToCheckout = async () => {
    if (carrito.length === 0) return;

    // Referencia al botón para dar feedback visual
    const checkoutBtn = document.querySelector('button[onclick="goToCheckout()"]');
    const originalText = checkoutBtn ? checkoutBtn.innerText : "Confirmar";
    
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = `<span class="animate-pulse">Guardando Selección...</span>`;
    }

    try {
        const total = carrito.reduce((sum, item) => sum + item.precio, 0);

        // Guardamos directamente en la colección "ventas"
        await addDoc(collection(db, "ventas"), {
            orderId: `SEL-${Date.now()}`,
            monto: total,
            items: carrito, // Guardamos la lista completa de objetos del carrito
            envio: {
                nombre: null,
                region: null,
                comuna: null,
                direccion: null,
                telefono: null,
                email: null
            },
            status: "SELECCIONADO",
            fecha: serverTimestamp()
        });

        // LIMPIEZA DEL CARRITO
        carrito = [];
        localStorage.removeItem('cart_data');
        localStorage.removeItem('pending_payment');
        updateCartUI();

        // Redirección directa al éxito
        window.location.href = "/cart/payment/success";

    } catch (error) {
        console.error("Error al procesar la selección:", error);
        alert("Hubo un error al guardar tu selección. Inténtalo de nuevo.");
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.innerText = originalText;
        }
    }
};

window.showCartModal = (show) => {
    const modal = document.getElementById('cart-modal');
    if(show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
};

window.filterCategory = (category, btn) => {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.replace('bg-green-600', 'bg-white/5'));
    btn.classList.replace('bg-white/5', 'bg-green-600');
    const filtered = category === 'all' ? productos : productos.filter(p => p.categoria === category);
    renderProducts(filtered);
};