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
// ПЕРЕИМЕНОВАЛИ ИМПОРТ:
import AccountView from '../views/AccountView.vue' 

// Импорты страниц (ленивая загрузка)
const DepositOpenView = () => import('../views/DepositOpenView.vue')
const DepositDetailsView = () => import('../views/DepositDetailsView.vue')
const LoanDetailsView = () => import('../views/LoanDetailsView.vue')
const LoanOpenView = () => import('../views/LoanOpenView.vue')
const TopUpView = () => import('../views/TopUpView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: HomeView },
    { path: '/my-bank', name: 'my-bank', component: () => import('../views/MyBankView.vue') },
    { path: '/messages', name: 'messages', component: () => import('../views/MessagesView.vue') },
    { path: '/shop', name: 'shop', component: () => import('../views/ShopView.vue') },
    { path: '/gov', name: 'gov', component: () => import('../views/GovView.vue') },
    { path: '/services', name: 'services', component: () => import('../views/ServicesView.vue') },
    { path: '/qr', name: 'qr', component: () => import('../views/QRView.vue') },
    { path: '/payments', name: 'payments', component: () => import('../views/PaymentsView.vue') },
    { path: '/topup', name: 'topup', component: () => import('../views/TopUpView.vue') },
    { path: '/open-deposit', name: 'open-deposit', component: () => import('../views/DepositOpenView.vue') },
    { path: '/deposits/:id', name: 'deposit-details', component: () => import('../views/DepositDetailsView.vue') },
    { path: '/open-loan', name: 'open-loan', component: () => import('../views/LoanOpenView.vue') },
    { path: '/loan', name: 'loan', component: () => import('../views/LoanDetailsView.vue') },

    // ФИКС БЕЛОГО ЭКРАНА: Оба пути ведут на Аккаунт
    { path: '/settings', name: 'settings', component: () => import('../views/AccountView.vue') },
    { path: '/account', name: 'account', component: () => import('../views/AccountView.vue') },
  ]
})

// Защита роутов
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.name !== 'login' && !token) {
        next({ name: 'login' });
    } else {
        next();
    }
});

export default router;