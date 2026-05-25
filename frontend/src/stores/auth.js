import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // 1. СОСТОЯНИЕ (STATE)
    const user = ref(JSON.parse(localStorage.getItem('user')) || {
        balance: 3400000,
        deposits: [],
        credits: [],
        isBlocked: false,
        name: 'АСЛАН МУСИН',
        iin: '000000000000',
        card_number: '8400 3435 3687 9207',
        card_cvv: '968',
        card_exp: '05/29'
    });

    const token = ref(localStorage.getItem('token') || 'demo-token');
    const isWinterMode = ref(localStorage.getItem('winter_mode') === 'true');
    const localAccounts = ref(JSON.parse(localStorage.getItem('local_accounts')) || []);

    // Сохранение в память браузера
    const save = () => {
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('local_accounts', JSON.stringify(localAccounts.value));
    };

    // --- ФУНКЦИИ ДЕПОЗИТА ---

    const openDeposit = (data) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const numAmount = Number(data.amount); // ФИКС: Гарантируем число
        const currentBalance = Number(user.value.balance); // ФИКС

        if (currentBalance >= numAmount) {
            user.value.balance = currentBalance - numAmount;
            if (!user.value.deposits) user.value.deposits = [];
            user.value.deposits.push({ 
                id: Date.now(), 
                amount: numAmount, 
                title: data.title, 
                type: data.type, 
                rate: data.rate,
                canWithdraw: data.type !== 'strict'
            });
            save();
        } else {
            throw new Error('Недостаточно средств на балансе карты');
        }
    };

    const replenishDeposit = (id, amount) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const num = Number(amount);
        const dep = user.value.deposits.find(d => d.id === id);
        if (user.value.balance >= num) {
            user.value.balance -= num;
            dep.amount += num;
            save();
        } else {
            throw new Error('Мало денег на карте');
        }
    };

    const withdrawToCard = (id, amount) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        const num = Number(amount);
        const dep = user.value.deposits.find(d => d.id === id);
        if (!dep.canWithdraw) throw new Error('С этого вклада нельзя снимать деньги до конца срока');
        if (dep.amount >= num) {
            dep.amount -= num;
            user.value.balance += num;
            save();
        } else {
            throw new Error('Недостаточно денег на депозите');
        }
    };

    const closeDeposit = (id) => {
        const index = user.value.deposits.findIndex(d => d.id === id);
        if (index !== -1) {
            user.value.balance += user.value.deposits[index].amount;
            user.value.deposits.splice(index, 1);
            save();
        }
    };
    
     const renameDeposit = (id, newTitle) => {
        const dep = user.value.deposits.find(d => d.id === id);
        if (dep) { dep.title = newTitle; save(); }
    };

    // --- ОСТАЛЬНЫЕ ФУНКЦИИ ---
    const register = async (credentials) => {
        await new Promise(r => setTimeout(r, 1500));
        const newUser = {
            ...credentials,
            balance: 5000,
            deposits: [],
            credits: [],
            isBlocked: false,
            card_number: "8400 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
            card_cvv: Math.floor(100 + Math.random() * 899).toString(),
            card_exp: "05/29"
        };
        localAccounts.value.push(newUser);
        user.value = newUser;
        token.value = 'demo-token';
        localStorage.setItem('token', 'demo-token');
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
            localStorage.setItem('token', 'demo-token');
            save();
            return true;
        } else {
            throw new Error('Данные не верны');
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const toggleBlockCard = () => {
        if (user.value) {
            user.value.isBlocked = !user.value.isBlocked;
            save();
        }
    };

    const takeLoan = (amount, months) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        user.value.balance += Number(amount);
        user.value.credits.push({ id: Date.now(), amount: Number(amount), monthlyPayment: Math.round((Number(amount) * 1.22) / months), monthsLeft: months });
        save();
    };

    const repayLoan = (amount, isFull = false) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        if (user.value.balance >= amount) {
            user.value.balance -= Number(amount);
            if (isFull) user.value.credits = [];
            else if (user.value.credits[0]) {
                user.value.credits[0].amount -= Number(amount);
                user.value.credits[0].monthsLeft -= 1;
            }
            save();
        }
    };

    const makeTransfer = (amount) => {
        user.value.balance -= Number(amount);
        save();
    };

    const toggleWinterMode = () => {
        isWinterMode.value = !isWinterMode.value;
        localStorage.setItem('winter_mode', isWinterMode.value);
    };

    return { 
        user, token, isWinterMode, register, login, logout, 
        toggleWinterMode, toggleBlockCard, openDeposit, takeLoan, repayLoan,
        replenishDeposit, withdrawToCard, closeDeposit, makeTransfer, renameDeposit, 
    };
});