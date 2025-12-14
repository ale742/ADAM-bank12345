import { defineStore } from 'pinia';
import axios from '../axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null
    }),
    actions: {
        async login(credentials) {
            const response = await axios.post('/login', credentials);
            this.token = response.data.token;
            this.user = response.data.user;
            localStorage.setItem('token', this.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        },
        async logout() {
            await axios.post('/logout');
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        },
        async fetchUser() {
            if(this.token) {
                const response = await axios.get('/user');
                this.user = response.data;
            }
        }
    }
});