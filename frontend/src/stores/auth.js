import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);
    const usersDB = ref(JSON.parse(localStorage.getItem('users_db')) || []);

    // 🔥 ЗИМНИЙ МОД (Читаем настройку из памяти)
    const isWinterMode = ref(localStorage.getItem('winter_mode') === 'true');

    const transactions = ref([
        { id: 1, type: 'shop', description: 'Magnum', amount: 2500, date: '2025-12-19 14:30' },
        { id: 2, type: 'transfer_in', description: 'Пополнение', amount: 5000, date: '2025-12-18 10:00' },
    ]);

    // --- ГЕНЕРАТОР ДАННЫХ ---
    const generateCardData = () => {
        let cardNumber = '8400';
        for (let i = 0; i < 3; i++) {
            const block = Math.floor(1000 + Math.random() * 9000);
            cardNumber += ` ${block}`;
        }
        
        const cvv = Math.floor(100 + Math.random() * 900); 
        const date = new Date();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = (date.getFullYear() + 3).toString().slice(-2);
        const expDate = `${month}/${year}`;
        const randomIbanSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
        const iban = `KZ99ADAM${randomIbanSuffix}`;

        const limits = {
            internet: true,
            internet_limit: 50000,
            cash_limit: 100000,
            transfer_limit: 150000
        };

        return { cardNumber, cvv, expDate, iban, limits, isBlocked: false };
    };

    // --- РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const exists = usersDB.value.find(u => u.email === credentials.email);
        if (exists) throw new Error('Пользователь с таким Email уже существует!');

        const cardData = generateCardData();

        const newUser = {
            id: Date.now(),
            name: credentials.name,
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password,
            balance: 10000,
            
            // Данные карты
            card_number: cardData.cardNumber,
            card_cvv: cardData.cvv,
            card_exp: cardData.expDate,
            iban: cardData.iban,
            limits: cardData.limits,
            isBlocked: false 
        };

        usersDB.value.push(newUser);
        localStorage.setItem('users_db', JSON.stringify(usersDB.value));
    };

    // --- ВХОД ---
    const login = async (credentials) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = usersDB.value.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (foundUser) {
            // Восстановление данных для старых юзеров
            if (!foundUser.card_cvv || !foundUser.card_number || foundUser.isBlocked === undefined) {
                const cardData = generateCardData();
                foundUser.card_number = foundUser.card_number || cardData.cardNumber;
                foundUser.card_cvv = foundUser.card_cvv || cardData.cvv;
                foundUser.card_exp = foundUser.card_exp || cardData.expDate;
                foundUser.iban = foundUser.iban || cardData.iban;
                foundUser.limits = foundUser.limits || cardData.limits;
                if (foundUser.isBlocked === undefined) foundUser.isBlocked = false;
                
                localStorage.setItem('users_db', JSON.stringify(usersDB.value));
            }
            setUser(foundUser);
        } else {
            throw new Error('Неверный логин или пароль');
        }
    };

    // 🔥 ПЕРЕКЛЮЧАТЕЛЬ ЗИМНЕГО МОДА
    const toggleWinterMode = () => {
        isWinterMode.value = !isWinterMode.value;
        localStorage.setItem('winter_mode', isWinterMode.value);
    };

    // Блокировка карты
    const toggleBlockCard = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (user.value) {
            user.value.isBlocked = !user.value.isBlocked;
            updateUserInDB();
        }
    };

    // Обновление лимитов
    const updateLimits = async (newLimits) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (user.value) {
            user.value.limits = newLimits;
            updateUserInDB();
        }
    };

    // Общая функция сохранения в базу
    const updateUserInDB = () => {
        localStorage.setItem('user', JSON.stringify(user.value));
        const idx = usersDB.value.findIndex(u => u.email === user.value.email);
        if (idx !== -1) {
            usersDB.value[idx] = user.value;
            localStorage.setItem('users_db', JSON.stringify(usersDB.value));
        }
    };

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
        
        if (user.value.isBlocked) throw new Error('Карта заблокирована! Операции недоступны.');

        if (user.value.balance < amount) throw new Error('Недостаточно средств');
        user.value.balance -= amount;
        transactions.value.unshift({ id: Date.now(), type: 'transfer', description: `Перевод ${phone}`, amount, date: 'Сейчас' });
        
        updateUserInDB();
    };

    return { 
        user, token, transactions, 
        isWinterMode, toggleWinterMode, // Экспортируем зимний мод
        login, register, logout, makeTransfer, updateLimits, toggleBlockCard 
    };
});