import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // Текущий активный юзер (кто вошел)
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    
    // 🔥 БАЗА ДАННЫХ В БРАУЗЕРЕ (Список всех зарегистрированных)
    const usersDB = ref(JSON.parse(localStorage.getItem('users_db')) || []);

    // История операций
    const transactions = ref([
        { id: 1, type: 'shop', description: 'Magnum', amount: 2500, date: '2025-12-19 14:30' },
        { id: 2, type: 'transfer_in', description: 'Пополнение', amount: 5000, date: '2025-12-18 10:00' },
    ]);

    // --- 1. РЕГИСТРАЦИЯ (Просто сохраняем, но не входим) ---
    const register = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Имитация задержки

        // Проверяем, нет ли уже такого email
        const exists = usersDB.value.find(u => u.email === credentials.email);
        if (exists) {
            throw new Error('Пользователь с таким Email уже существует!');
        }

        const newUser = {
            id: Date.now(),
            name: credentials.name,
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password, // В реальном проекте пароли так хранить нельзя!
            balance: 10000 // Бонус при регистрации
        };

        // Добавляем в "базу"
        usersDB.value.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(usersDB.value));
        
        // ВАЖНО: Мы НЕ делаем setUser(newUser), то есть не входим автоматически
    };

    // --- 2. ВХОД (Ищем в базе) ---
    const login = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Ищем пользователя в нашей "базе"
        const foundUser = usersDB.value.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (foundUser) {
            // Если нашли - авторизуем
            setUser(foundUser);
        } else {
            // Если не нашли
            throw new Error('Неверный логин или пароль');
        }
    };

    // Вспомогательная: Сохранение сессии
    const setUser = (userData) => {
        user.value = userData;
        token.value = 'mock-token-' + Date.now();
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token.value);
    };

    // Выход
    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Перевод
    const makeTransfer = async (amount, phone) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (user.value.balance < amount) throw new Error('Недостаточно средств');
        user.value.balance -= amount;
        transactions.value.unshift({
            id: Date.now(),
            type: 'transfer',
            description: `Перевод: ${phone}`,
            amount: amount,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('user', JSON.stringify(user.value));
        
        // Обновляем и в "общей базе", чтобы баланс сохранился
        const index = usersDB.value.findIndex(u => u.email === user.value.email);
        if (index !== -1) {
            usersDB.value[index].balance = user.value.balance;
            localStorage.setItem('users_db', JSON.stringify(usersDB.value));
        }
    };

    return { user, token, transactions, login, register, logout, makeTransfer };
});