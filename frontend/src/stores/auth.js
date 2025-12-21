import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Данные
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    const usersDB = ref(JSON.parse(localStorage.getItem('users_db')) || []);
    
    // История
    const transactions = ref([
        { id: 1, type: 'shop', description: 'Magnum', amount: 2500, date: '2025-12-19 14:30' },
        { id: 2, type: 'transfer_in', description: 'Пополнение', amount: 5000, date: '2025-12-18 10:00' },
    ]);

    // Генератор
    const generateCardData = () => {
        let cardNumber = '8400';
        for (let i = 0; i < 3; i++) cardNumber += ` ${Math.floor(1000 + Math.random() * 9000)}`;
        
        return { 
            cardNumber, 
            cvv: Math.floor(100 + Math.random() * 900), 
            expDate: '12/28',
            iban: `KZ99ADAM${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            limits: {
                internet: true,
                internet_limit: 50000,
                cash_limit: 100000,
                transfer_limit: 150000
            }
        };
    };

    // Регистрация
    const register = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (usersDB.value.find(u => u.email === credentials.email)) throw new Error('Email занят');

        const cardData = generateCardData();
        const newUser = {
            id: Date.now(),
            ...credentials,
            balance: 10000,
            ...cardData
        };

        usersDB.value.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(usersDB.value));
    };

    // Вход
    const login = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundUser = usersDB.value.find(u => u.email === credentials.email && u.password === credentials.password);
        
        if (!foundUser) throw new Error('Неверный логин');

        // Если старый юзер без данных - обновим его
        if (!foundUser.limits || !foundUser.iban) {
            const extra = generateCardData();
            foundUser.limits = foundUser.limits || extra.limits;
            foundUser.iban = foundUser.iban || extra.iban;
            foundUser.card_number = foundUser.card_number || extra.cardNumber;
            // Сохраняем обновление в базу
            localStorage.setItem('users_db', JSON.stringify(usersDB.value));
        }

        setUser(foundUser);
    };

    // 🔥 ОБНОВЛЕНИЕ ЛИМИТОВ (Вот она!)
    const updateLimits = async (newLimits) => {
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 500));

        if (user.value) {
            // 1. Обновляем текущего юзера
            user.value.limits = newLimits;
            localStorage.setItem('user', JSON.stringify(user.value));

            // 2. Обновляем в базе всех юзеров
            const idx = usersDB.value.findIndex(u => u.email === user.value.email);
            if (idx !== -1) {
                usersDB.value[idx].limits = newLimits;
                localStorage.setItem('users_db', JSON.stringify(usersDB.value));
            }
        }
    };

    // Вспомогательные
    const setUser = (u) => {
        user.value = u;
        token.value = 'token';
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('token', 'token');
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const makeTransfer = async (amount, phone) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (user.value.balance < amount) throw new Error('Недостаточно средств');
        user.value.balance -= amount;
        transactions.value.unshift({ id: Date.now(), type: 'transfer', description: `Перевод ${phone}`, amount, date: 'Сейчас' });
        localStorage.setItem('user', JSON.stringify(user.value));
    };

    // 🔥 ВАЖНО: Возвращаем updateLimits наружу!
    return { user, token, transactions, login, register, logout, makeTransfer, updateLimits };
});