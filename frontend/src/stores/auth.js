import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../axios';

export const useAuthStore = defineStore('auth', () => {
    // Данные из localStorage
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    
    // История операций
    const transactions = ref([]);

    // --- ЗИМНИЙ МОД (Фронтенд фича) ---
    const isWinterMode = ref(localStorage.getItem('winter_mode') === 'true');
    const toggleWinterMode = () => {
        isWinterMode.value = !isWinterMode.value;
        localStorage.setItem('winter_mode', isWinterMode.value);
    };

    // --- 1. РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        try {
            const response = await axios.post('/register', {
                name: credentials.name,
                email: credentials.email,
                phone: credentials.phone,
                password: credentials.password
            });
            setUser(response.data.user, response.data.token);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ошибка регистрации');
        }
    };

    // --- 2. ВХОД ---
    const login = async (credentials) => {
        try {
            const response = await axios.post('/login', {
                email: credentials.email,
                password: credentials.password
            });
            setUser(response.data.user, response.data.token);
            fetchTransactions(); // Грузим историю
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Неверный логин или пароль');
        }
    };

    // --- 3. ВЫХОД ---
    const logout = async () => {
        try { await axios.post('/logout'); } catch (e) {}
        user.value = null;
        token.value = null;
        transactions.value = [];
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // --- 4. ПЕРЕВОД ---
    const makeTransfer = async (amount, phone) => {
        try {
            const response = await axios.post('/transfer', {
                amount: amount,
                phone: phone
            });
            // Обновляем баланс данными с сервера
            user.value.balance = response.data.balance;
            localStorage.setItem('user', JSON.stringify(user.value));
            
            // Обновляем историю
            await fetchTransactions();
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Ошибка перевода');
        }
    };

    // --- 5. ОБНОВЛЕНИЕ ЛИМИТОВ (Теперь через API) ---
    const updateLimits = async (newLimits) => {
        try {
            const response = await axios.post('/limits', { limits: newLimits });
            // Сервер вернет обновленные лимиты
            user.value.limits = response.data.limits;
            localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
            throw new Error('Не удалось сохранить лимиты');
        }
    };
    
    // --- 6. БЛОКИРОВКА КАРТЫ (Теперь через API) ---
    const toggleBlockCard = async () => {
        try {
            const response = await axios.post('/block-card');
            // Сервер вернет новый статус
            user.value.is_blocked = response.data.is_blocked;
            localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
            throw new Error('Ошибка изменения статуса карты');
        }
    };

    // --- 7. ЗАГРУЗКА ИСТОРИИ ---
    const fetchTransactions = async () => {
        if (!token.value) return;
        try {
            const response = await axios.get('/transactions');
            transactions.value = response.data.map(tr => ({
                id: tr.id,
                type: tr.type,
                amount: tr.amount,
                description: tr.description,
                date: new Date(tr.created_at).toLocaleString('ru-RU', { 
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
                })
            }));
        } catch (e) {
            console.error('Ошибка загрузки истории');
        }
    };

    // Вспомогательные
    const setUser = (userData, tokenData) => {
        user.value = userData;
        token.value = tokenData;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', tokenData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
    };

    // Инициализация при загрузке
    if (token.value) {
        fetchTransactions();
    }

    return { 
        user, token, transactions, isWinterMode,
        login, register, logout, makeTransfer, 
        toggleWinterMode, updateLimits, toggleBlockCard, fetchTransactions
    };
});