import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // --- 1. СОСТОЯНИЕ (STATE) ---
    const isDarkMode = ref(localStorage.getItem('dark_mode') === 'true');
    const isWinterMode = ref(localStorage.getItem('winter_mode') === 'true');
    const token = ref(localStorage.getItem('token') || null);
    const localAccounts = ref(JSON.parse(localStorage.getItem('local_accounts')) || []);

    const user = ref(JSON.parse(localStorage.getItem('user')) || null);

    // --- 2. ИНИЦИАЛИЗАЦИЯ ТЕМЫ ---
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark-theme');
    }

    // Сохранение данных
    const save = () => {
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('local_accounts', JSON.stringify(localAccounts.value));
        if (token.value) {
            localStorage.setItem('token', token.value);
        }
    };

    // --- 3. УНИВЕРСАЛЬНАЯ ИСТОРИЯ ---
    const addTransaction = (data) => {
        if (!user.value) return;
        if (!user.value.transactions) user.value.transactions = [];
        
        user.value.transactions.unshift({
            id: Date.now(),
            date: new Date().toLocaleString('ru-RU'),
            title: data.title,
            amount: Number(data.amount),
            type: data.type, // 'income' или 'expense'
            category: data.category, 
            target: data.target || '',
            from: data.from || 'ADAM Card'
        });
        save();
    };

    // --- 4. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        await new Promise(r => setTimeout(r, 1500));
        
        const newUser = {
            ...credentials,
            balance: 100000,
            deposits: [],
            credits: [],
            transactions: [],
            isBlocked: false,
            card_number: "8400 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
            card_cvv: Math.floor(100 + Math.random() * 899).toString(),
            card_exp: "05/29",
            avatar: null,
            iban: 'KZ99ADAM' + Math.floor(Math.random() * 1000000000)
        };

        localAccounts.value.push(newUser);
        user.value = newUser;
        token.value = 'demo-token';
        save();
        return true;
    };

    const login = async (credentials) => {
        await new Promise(r => setTimeout(r, 1000));
        const found = localAccounts.value.find(acc => 
            (acc.iin === credentials.iin && acc.password === credentials.password) ||
            (acc.phone === credentials.phone)
        );

        if (found) {
            user.value = found;
            token.value = 'demo-token';
            save();
            return true;
        } else {
            throw new Error('Данные не верны или аккаунт не существует');
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        location.reload();
    };

    // --- 5. ФУНКЦИИ АККАУНТА И ТЕМЫ ---
    const updateAvatar = (imgData) => {
        if (!user.value) return;
        user.value.avatar = imgData;
        save();
    };

    const toggleDarkMode = () => {
        isDarkMode.value = !isDarkMode.value;
        localStorage.setItem('dark_mode', isDarkMode.value);
        document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
    };

    const toggleWinterMode = () => {
        isWinterMode.value = !isWinterMode.value;
        localStorage.setItem('winter_mode', isWinterMode.value);
    };

    const toggleBlockCard = () => {
        if (!user.value) return;
        user.value.isBlocked = !user.value.isBlocked;
        save();
    };

    // --- 6. ФУНКЦИИ ДЕПОЗИТА ---
    const openDeposit = (data) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        if (user.value.deposits.length >= 5) throw new Error('Максимальное количество депозитов — 5');
        
        const numAmount = Number(data.amount); 
        const currentBalance = Number(user.value.balance); 

        if (currentBalance >= numAmount) {
            user.value.balance = currentBalance - numAmount;
            if (!user.value.deposits) user.value.deposits = [];
            user.value.deposits.push({ 
                id: data.id || Date.now(), 
                amount: numAmount, 
                title: data.title, 
                type: data.type, 
                rate: data.rate,
                canWithdraw: data.type !== 'strict',
                isAmountHidden: false,
                createdAt: Date.now()
            });
            
            addTransaction({
                title: `Открытие: ${data.title}`,
                amount: numAmount,
                type: 'expense',
                category: 'deposit',
                target: 'Счет депозита'
            });
        } else {
            throw new Error('Недостаточно средств на балансе карты');
        }
    };

    const replenishDeposit = (id, amount) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const num = Number(amount);
        const currentBalance = Number(user.value.balance);

        if (currentBalance >= num) {
            const dep = user.value.deposits.find(d => d.id == id);
            user.value.balance = currentBalance - num;
            dep.amount += num;
            
            addTransaction({
                title: `Пополнение: ${dep.title}`,
                amount: num,
                type: 'expense',
                category: 'deposit',
                target: dep.title
            });
        } else {
            throw new Error('Недостаточно средств на основном счете');
        }
    };

    const withdrawToCard = (id, amount) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const num = Number(amount);
        const dep = user.value.deposits.find(d => d.id == id);
        
        if (!dep.canWithdraw) throw new Error('Этот депозит без права снятия');
        
        const remainder = dep.amount - num;
        if (remainder > 0 && remainder < 1000) {
            throw new Error('Неснижаемый остаток — 1000 ₸.');
        }

        if (dep.amount >= num) {
            dep.amount -= num;
            user.value.balance = Number(user.value.balance) + num;
            
            addTransaction({
                title: `Снятие: ${dep.title}`,
                amount: num,
                type: 'income',
                category: 'deposit',
                target: 'ADAM Card'
            });
        } else {
            throw new Error('Недостаточно денег на депозите');
        }
    };

    const closeDeposit = (id) => {
        const index = user.value.deposits.findIndex(d => d.id == id);
        if (index !== -1) {
            const amount = user.value.deposits[index].amount;
            const title = user.value.deposits[index].title;
            user.value.balance = Number(user.value.balance) + amount;
            
            addTransaction({
                title: `Закрытие вклада: ${title}`,
                amount: amount,
                type: 'income',
                category: 'deposit'
            });
            user.value.deposits.splice(index, 1);
            save();
        }
    };

    const renameDeposit = (id, newTitle) => {
        const dep = user.value.deposits.find(d => d.id == id);
        if (dep) { dep.title = newTitle; save(); }
    };

    const toggleDepVisibility = (id) => {
        const dep = user.value.deposits.find(d => d.id == id);
        if (dep) { dep.isAmountHidden = !dep.isAmountHidden; save(); }
    };

    const checkAutoCloseRule = () => {
        const now = Date.now();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        if (!user.value?.deposits) return;
        user.value.deposits = user.value.deposits.filter(dep => {
            if ((now - dep.createdAt) > threeDaysMs && dep.amount < 1000) {
                user.value.balance += dep.amount;
                return false;
            }
            return true;
        });
        save();
    };

    // --- 7. ФУНКЦИИ КРЕДИТА ---
    const applyLoan = (data) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const amount = Number(data.amount);
        const months = Number(data.months);
        let rate = months >= 12 ? 18 : 15;
        const totalToReturn = Math.round(amount * (1 + (rate / 100)));

        user.value.balance = Number(user.value.balance) + amount;
        user.value.credits.push({
            id: Date.now(),
            amount: amount,
            remainingDebt: totalToReturn,
            monthlyPayment: Math.round(totalToReturn / months),
            rate: rate,
            months: months,
            monthsLeft: months,
            title: 'Персональный кредит'
        });

        addTransaction({
            title: 'Зачисление кредита',
            amount: amount,
            type: 'income',
            category: 'loan'
        });
    };

    const repayLoan = (loanId, amount, isFull = false) => {
        const num = Number(amount);
        const currentBal = Number(user.value.balance);
        if (currentBal < num) throw new Error('Недостаточно средств');

        const loan = user.value.credits.find(c => c.id === loanId);
        user.value.balance = currentBal - num;
        
        addTransaction({
            title: isFull ? 'Полное погашение кредита' : 'Платеж по кредиту',
            amount: num,
            type: 'expense',
            category: 'loan'
        });

        if (isFull) {
            user.value.credits = user.value.credits.filter(c => c.id !== loanId);
        } else {
            loan.remainingDebt -= num;
            loan.monthsLeft -= 1;
            if (loan.remainingDebt <= 0) user.value.credits = [];
        }
        save();
    };

    // --- 8. ПЛАТЕЖИ И ПЕРЕВОДЫ (ФИКС АРГУМЕНТОВ) ---
    const processPayment = (amount, title = 'Платеж', category = 'payment', target = 'Поставщик') => {
        const num = Number(amount);
        const currentBal = Number(user.value.balance);
        
        if (currentBal >= num) {
            user.value.balance = currentBal - num;
            addTransaction({
                title: title,
                amount: num,
                type: 'expense',
                category: category,
                target: target
            });
            save();
        } else {
            throw new Error('Недостаточно средств на балансе');
        }
    };

    const topUpBalance = (amount) => {
        const num = Number(amount);
        user.value.balance = Number(user.value.balance) + num;
        addTransaction({
            title: 'Пополнение Adam Card',
            amount: num,
            type: 'income',
            category: 'topup',
            target: 'Банкомат'
        });
    };

    const makeTransfer = (amount, phone) => {
        const num = Number(amount);
        if (Number(user.value.balance) >= num) {
            user.value.balance = Number(user.value.balance) - num;
            addTransaction({
                title: 'Перевод клиенту',
                amount: num,
                type: 'expense',
                category: 'transfer',
                target: phone
            });
        } else throw new Error('Недостаточно средств');
    };

    const transferFromDepToCard = (depId, amount) => {
        const dep = user.value.deposits.find(d => d.id === depId);
        const num = Number(amount);
        const remainder = dep.amount - num;
        if (remainder > 0 && remainder < 1000) {
            throw new Error('Неснижаемый остаток — 1000 ₸.');
        }
        if (dep && dep.amount >= num) {
            dep.amount -= num;
            user.value.balance = Number(user.value.balance) + num;
            addTransaction({
                title: `Перевод с: ${dep.title}`,
                amount: num,
                type: 'income',
                category: 'deposit'
            });
        } else throw new Error('Недостаточно средств на депозите');
    };

    const executeTransfer = (data) => {
        const num = Number(data.amount);
            if (user.value.balance < num) throw new Error('Недостаточно средств');

            user.value.balance -= num;
    
            // Запись в историю
        addTransaction({
            title: data.title,
            amount: num,
            type: 'expense',
            category: 'transfer',
            target: data.target,
            from: data.from || 'ADAM Card'
        });
        save();
    };


    return { 
        user, token, isWinterMode, isDarkMode, register, login, logout, 
        toggleWinterMode, toggleBlockCard, openDeposit, repayLoan,
        replenishDeposit, withdrawToCard, closeDeposit, renameDeposit, toggleDepVisibility,
        topUpBalance, transferFromDepToCard, checkAutoCloseRule, processPayment, toggleDarkMode, 
        applyLoan, updateAvatar, addTransaction, executeTransfer,
    };
});