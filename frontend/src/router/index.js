import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MessagesView from '../views/MessagesView.vue'
import MyBankView from '../views/MyBankView.vue'
import TransferView from '../views/TransferView.vue' 
import ShopView from '../views/ShopView.vue'
import GovView from '../views/GovView.vue'
import ServicesView from '../views/ServicesView.vue'
import QRView from '../views/QRView.vue'
import PaymentsView from '../views/PaymentsView.vue'
import SettingsView from '../views/SettingsView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: HomeView },
    { path: '/messages', name: 'messages', component: MessagesView },
    { path: '/my-bank', name: 'my-bank', component: MyBankView },
    { path: '/transfer', name: 'transfer', component: TransferView },
    { path: '/shop', name: 'shop', component: ShopView },
    { path: '/gov', name: 'gov', component: GovView },
    { path: '/services', name: 'services', component: ServicesView },
    { path: '/qr', name: 'qr', component: QRView },
    { path: '/payments', name: 'payments', component: PaymentsView },
    { path: '/settings', name: 'settings', component: SettingsView },
  ]
})

// Защита роутов
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.name !== 'login' && !token) next({ name: 'login' });
    else next();
});

export default router;