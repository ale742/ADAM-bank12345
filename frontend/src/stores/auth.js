import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    const usersDB = ref(JSON.parse(localStorage.getItem('users_db')) || []);

    const transactions = ref([
        { id: 1, type: 'shop', description: 'Magnum', amount: 2500, date: '2025-12-19 14:30' },
        { id: 2, type: 'transfer_in', description: 'Пополнение', amount: 5000, date: '2025-12-18 10:00' },
    ]);

    // --- ГЕНЕРАТОР КАРТЫ ---
    const generateCardData = () => {
        // 1. Номер карты: 8400 + 12 рандомных цифр
        let cardNumber = '8400';
        for (let i = 0; i < 3; i++) {
            const block = Math.floor(1000 + Math.random() * 9000); // Случайное число от 1000 до 9999
            cardNumber += ` ${block}`;
        }

        // 2. CVV: 3 случайные цифры
        const cvv = Math.floor(100 + Math.random() * 900);

        // 3. Срок действия: Сегодня + 3 года (Формат MM/YY)
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 3).toString().slice(-2); // Берем последние 2 цифры года
        const expDate = `${month}/${year}`;

        return { cardNumber, cvv, expDate };
    };

    // --- РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const exists = usersDB.value.find(u => u.email === credentials.email);
        if (exists) throw new Error('Пользователь уже существует!');

        // Генерируем данные карты
        const cardData = generateCardData();

        const newUser = {
            id: Date.now(),
            name: credentials.name,
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password,
            balance: 10000,
            // Добавляем данные карты в профиль
            card_number: cardData.cardNumber,
            card_cvv: cardData.cvv,
            card_exp: cardData.expDate
        };

        usersDB.value.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(usersDB.value));
    };

    // --- ВХОД ---
    const login = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const foundUser = usersDB.value.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (foundUser) {
            // Если у старого юзера нет карты (создавали раньше), сгенерируем на лету
            if (!foundUser.card_number) {
                const cardData = generateCardData();
                foundUser.card_number = cardData.cardNumber;
                foundUser.card_cvv = cardData.cvv;
                foundUser.card_exp = cardData.expDate;
            }
            setUser(foundUser);
        } else {
            throw new Error('Неверный логин или пароль');
        }
    };

    const setUser = (userData) => {
        user.value = userData;
        token.value = 'mock-token-' + Date.now();
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token.value);
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

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
    };

    return { user, token, transactions, login, register, logout, makeTransfer };
});