import { defineStore } from 'pinia';
import axios from '../axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null
    }),
    actions: {
        // Логин
        async login(credentials) {
            const response = await axios.post('/login', credentials);
            this.setToken(response.data.token);
            this.user = response.data.user;
        },
        // Регистрация (Добавили это!)
        async register(credentials) {
            const response = await axios.post('/register', credentials);
            this.setToken(response.data.token);
            // После регистрации сразу запрашиваем данные юзера
            await this.fetchUser();
        },
        // Сохранение токена
        setToken(token) {
            this.token = token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },
        // Выход
        async logout() {
            try {
                await axios.post('/logout');
            } catch (error) {
                console.log(error);
            }
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        },
        // Получить инфо о юзере
        async fetchUser() {
            if(this.token) {
                try {
                    const response = await axios.get('/user');
                    this.user = response.data;
                } catch (error) {
                    this.logout();
                }
            }
        }
    }
});