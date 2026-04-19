import { auth } from "../firebase/credentials.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const privateRoutes = ['/catalog/', '/prices/', '/account/', '/cart/'];
const currentPath = window.location.pathname;

onAuthStateChanged(auth, (user) => {
    const userInterface = document.getElementById('user-interface');

    if (user) {
        const userTemplate = `
            <div class="relative inline-block text-left">
                <button id="profile-menu-btn" class="flex items-center space-x-3 p-2 rounded-2xl hover:bg-white/5 transition-all group">
                    <div class="flex flex-col items-end leading-none">
                        <span class="text-[9px] text-green-500 uppercase font-black tracking-widest mb-1">Conectado</span>
                        <span class="text-sm text-white font-bold group-hover:text-green-400 transition-colors">${user.displayName || 'Usuario'}</span>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 font-bold">
                        ${(user.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                </button>

                <div id="dropdown-menu" class="absolute right-0 mt-3 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 opacity-0 scale-95 pointer-events-none transition-all duration-200 z-[110]">
                    <a href="/account/dashboard/" class="flex items-center px-4 py-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <svg class="w-4 h-4 mr-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Mi Cuenta
                    </a>
                    <a href="/help/" class="flex items-center px-4 py-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <svg class="w-4 h-4 mr-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Ayuda
                    </a>
                    <div class="border-t border-white/5 my-1"></div>
                    <button id="logout-btn" class="w-full flex items-center px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;

        if (userInterface) {
            userInterface.innerHTML = userTemplate;

            const btn = document.getElementById('profile-menu-btn');
            const menu = document.getElementById('dropdown-menu');
            const logout = document.getElementById('logout-btn');

            if (btn && menu) {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('opacity-0');
                    menu.classList.toggle('scale-95');
                    menu.classList.toggle('pointer-events-none');
                };

                document.addEventListener('click', () => {
                    menu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
                }, { once: false });
            }

            logout?.addEventListener('click', () => {
                signOut(auth).then(() => window.location.replace('/auth/login/'));
            });
        }
    } else {
        if (privateRoutes.some(route => currentPath.includes(route))) {
            window.location.replace('/auth/login/');
        }
    }
});