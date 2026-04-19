import { db } from "/firebase/credentials.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- DATOS CHILE ---
const chileData = {
    "Región Metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "San Bernardo"],
    "Biobío": ["Concepción", "Talcahuano", "Coronel", "Los Ángeles"],
    "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"]
};

// --- CONFIGURACIÓN STRIPE ---
const stripe = Stripe('pk_test_51TNi2fJkgnB9h1TC9qAuBIip5w22Q8v70TRozQ3RgDFqGaDn5n7UqN0x0RukJ20JWZpDkPpGRXVZOHCZplmRFyze00nnhFDo9L'); 
const elements = stripe.elements();
const cardStyle = {
    base: {
        color: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        fontSize: '14px',
        '::placeholder': { color: '#4b5563' }
    }
};
const cardElement = elements.create('card', { style: cardStyle, hidePostalCode: true });
cardElement.mount('#stripe-card-element');

// --- CARGA DE DATOS ---
const session = JSON.parse(localStorage.getItem('pending_payment'));
if (!session) window.location.href = "/catalog/";

const regionSelect = document.getElementById('cust-region');
const communeSelect = document.getElementById('cust-commune');

Object.keys(chileData).forEach(region => {
    const opt = document.createElement('option');
    opt.value = region; opt.textContent = region;
    regionSelect.appendChild(opt);
});

regionSelect.addEventListener('change', (e) => {
    const region = e.target.value;
    communeSelect.innerHTML = '<option value="">Selecciona Comuna</option>';
    if (region) {
        chileData[region].forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            communeSelect.appendChild(opt);
        });
        communeSelect.disabled = false;
    }
});

const renderSummary = () => {
    document.getElementById('payment-total').innerText = `$${session.total.toLocaleString()}`;
    document.getElementById('mini-cart-list').innerHTML = session.items.map(item => `
        <div class="flex items-center justify-between bg-white/5 p-3 rounded-2xl">
            <div class="flex items-center gap-3">
                <img src="/assets/catalog/${item.imagen}" class="w-10 h-10 object-cover rounded-lg border border-white/5">
                <div><p class="text-[11px] text-white font-bold">${item.nombre}</p></div>
            </div>
            <p class="text-xs font-black text-gray-300">$${item.precio.toLocaleString()}</p>
        </div>
    `).join('');
};

// --- PROCESAR PAGO ---
document.getElementById('submit-button').addEventListener('click', async () => {
    const fields = ['cust-name', 'cust-region', 'cust-commune', 'cust-address', 'cust-phone', 'cust-email'];
    const valid = fields.every(id => document.getElementById(id).value);

    if (!valid) return alert("Completa todos los datos de envío.");

    const btn = document.getElementById('submit-button');
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">Procesando...</span>`;

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
        document.getElementById('card-errors').textContent = error.message;
        btn.disabled = false;
        btn.innerText = "Confirmar Compra";
    } else {
        try {
            await addDoc(collection(db, "ventas"), {
                orderId: session.id,
                monto: session.total,
                items: session.items, // CRÍTICO: Guardamos qué compró
                token: token.id,
                envio: {
                    nombre: document.getElementById('cust-name').value,
                    region: document.getElementById('cust-region').value,
                    comuna: document.getElementById('cust-commune').value,
                    direccion: document.getElementById('cust-address').value,
                    telefono: document.getElementById('cust-phone').value,
                    email: document.getElementById('cust-email').value
                },
                status: "PENDIENTE", // Estados: PENDIENTE, ENVIADO, ENTREGADO
                fecha: serverTimestamp()
            });

            localStorage.removeItem('pending_payment');
            window.location.href = "/dashboard/success";
        } catch (e) {
            console.error(e);
            btn.disabled = false;
            btn.innerText = "Error al guardar";
        }
    }
});

renderSummary();