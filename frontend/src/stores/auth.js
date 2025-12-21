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

    // --- ГЕНЕРАТОР КАРТЫ И IBAN ---
    const generateCardData = () => {
        // 1. Номер карты
        let cardNumber = '8400';
        for (let i = 0; i < 3; i++) {
            const block = Math.floor(1000 + Math.random() * 9000);
            cardNumber += ` ${block}`;
        }

        // 2. CVV
        const cvv = Math.floor(100 + Math.random() * 900);

        // 3. Срок действия
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 3).toString().slice(-2);
        const expDate = `${month}/${year}`;

        // 4. IBAN
        const randomIbanSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
        const iban = `KZ99ADAM${randomIbanSuffix}`;

        return { cardNumber, cvv, expDate, iban };
    };

    // --- РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const exists = usersDB.value.find(u => u.email === credentials.email);
        if (exists) throw new Error('Пользователь с таким Email уже существует!');

        // Генерируем данные
        const cardData = generateCardData();

        const newUser = {
            id: Date.now(),
            name: credentials.name,
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password,
            balance: 10000,
            card_number: cardData.cardNumber,
            card_cvv: cardData.cvv,
            card_exp: cardData.expDate,
            iban: cardData.iban
        };

        usersDB.value.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(usersDB.value));
    };

    // --- ВХОД (ИСПРАВЛЕНО) ---
    const login = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Ищем пользователя
        const foundUser = usersDB.value.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (foundUser) {
            // Проверяем, есть ли у него карта и IBAN (для старых аккаунтов)
            let needUpdate = false;
            
            // Если чего-то не хватает, генерируем данные
            if (!foundUser.card_number || !foundUser.iban) {
                const cardData = generateCardData(); // Генерируем один раз здесь

                if (!foundUser.card_number) {
                    foundUser.card_number = cardData.cardNumber;
                    foundUser.card_cvv = cardData.cvv;
                    foundUser.card_exp = cardData.expDate;
                    needUpdate = true;
                }
                
                if (!foundUser.iban) {
                    foundUser.iban = cardData.iban;
                    needUpdate = true;
                }
            }

            // Если обновили данные старого юзера, сохраняем в "базу"
            if (needUpdate) {
                localStorage.setItem('users_db', JSON.stringify(usersDB.value));
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
        
        // Обновляем баланс в базе
        const index = usersDB.value.findIndex(u => u.email === user.value.email);
        if (index !== -1) {
            usersDB.value[index].balance = user.value.balance;
            localStorage.setItem('users_db', JSON.stringify(usersDB.value));
        }
    };

    return { user, token, transactions, login, register, logout, makeTransfer };
});