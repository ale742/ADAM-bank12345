import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import MessagesView from '../views/MessagesView.vue'
import MyBankView from '../views/MyBankView.vue'
import TransferView from '../views/TransferView.vue' 
import ShopView from '../views/ShopView.vue'
import GovView from '../views/GovView.vue'
import QRView from '../views/QRView.vue'
import PaymentsView from '../views/PaymentsView.vue'
import AccountView from '../views/AccountView.vue'
import HistoryView from '../views/HistoryView.vue' // Наш новый файл

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
    { path: '/qr', name: 'qr', component: QRView },
    { path: '/payments', name: 'payments', component: PaymentsView },
    { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') }, { path: '/settings', redirect: '/account' },
    { path: '/history', name: 'history', component: HistoryView },
    
    // Доп. страницы (ленивая загрузка)
    { path: '/topup', name: 'topup', component: () => import('../views/TopUpView.vue') },
    { path: '/open-deposit', name: 'open-deposit', component: () => import('../views/DepositOpenView.vue') },
    { path: '/deposits/:id', name: 'deposit-details', component: () => import('../views/DepositDetailsView.vue') },
    { path: '/open-loan', name: 'open-loan', component: () => import('../views/LoanOpenView.vue') },
    { path: '/loan', name: 'loan', component: () => import('../views/LoanDetailsView.vue') },
  ]
})

// Защита роутов
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.name !== 'login' && !token) next({ name: 'login' });
    else next();
});

export default router;