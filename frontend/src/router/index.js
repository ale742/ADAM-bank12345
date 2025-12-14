import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import MessagesView from '../views/MessagesView.vue'
import ServicesView from '../views/ServicesView.vue'
import QRView from '../views/QRView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/messages', name: 'messages', component: MessagesView },
    { path: '/services', name: 'services', component: ServicesView },
    { path: '/qr', name: 'qr', component: QRView },
  ]
})

// Защита роутов (если не залогинен - на вход)
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.name !== 'login' && !token) next({ name: 'login' });
    else next();
});

export default router;