import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // --- 1. СНАЧАЛА ОБЪЯВЛЯЕМ ВСЕ ПЕРЕМЕННЫЕ (STATE) ---
    const isDarkMode = ref(localStorage.getItem('dark_mode') === 'true');
    const isWinterMode = ref(localStorage.getItem('winter_mode') === 'true');
    const isTyping = ref(false);
    const token = ref(localStorage.getItem('token') || null);
    const localAccounts = ref(JSON.parse(localStorage.getItem('local_accounts')) || []);
    const notifications = ref(JSON.parse(localStorage.getItem('notifications')) || []);
    
    // Инициализируем юзера (добавил пустой массив транзакций сразу)
    const user = ref(JSON.parse(localStorage.getItem('user')) || {
        balance: 100000,
        deposits: [],
        credits: [],
        transactions: [],
        isBlocked: false,
        name: 'MUSSIN ASLAN',
        iin: '070524551465',
        card_number: '8400 3435 3687 9207',
        card_cvv: '968',
        card_exp: '05/29',
        avatar: null
    });

    const chatMessages = ref(JSON.parse(localStorage.getItem('chat_history')) || [
        { id: 1, role: 'bot', text: 'Салам! Я — Adam AI. Чем помочь?', date: new Date().toLocaleTimeString() } 
    ]);

    // --- 2. ТЕПЕРЬ МОЖНО ИНИЦИАЛИЗИРОВАТЬ ТЕМУ (КОГДА ПЕРЕМЕННАЯ ЕСТЬ) ---
    if (isDarkMode.value) {
        document.documentElement.classList.add('dark-theme');
    }

    // --- 3. СИСТЕМНЫЕ ФУНКЦИИ ---
    const save = () => {
        localStorage.setItem('user', JSON.stringify(user.value));
        localStorage.setItem('local_accounts', JSON.stringify(localAccounts.value));
        localStorage.setItem('chat_history', JSON.stringify(chatMessages.value));
        if (token.value) {
            localStorage.setItem('token', token.value);
        }
    };

    const saveChat = () => save(); // Просто вызываем общую функцию сохранения

    const playNotifySound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.log('Звук не запустился'));
    };

    const pushNotification = (title, msg, type = 'info', extra = null) => {
        const newNotify = {
            id: Date.now(),
            date: new Date().toLocaleString('ru-RU'),
            title, msg, type, extra, isRead: false
        };
        notifications.value.unshift(newNotify);
        playNotifySound();
        localStorage.setItem('notifications', JSON.stringify(notifications.value));
    };

    const addTransaction = (data) => {
        if (!user.value) return;
        if (!user.value.transactions) user.value.transactions = [];
        user.value.transactions.unshift({
            id: Date.now(),
            date: new Date().toLocaleString('ru-RU'),
            title: data.title,
            amount: Number(data.amount),
            type: data.type, 
            category: data.category, 
            target: data.target || '',
            from: data.from || 'ADAM Card'
        });
        save();
    };

    // --- 4. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ---
    const register = async (credentials) => {
        await new Promise(r => setTimeout(r, 1500));
        
        // newUser теперь внутри функции, где credentials определен
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
            throw new Error('Данные не верны');
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        location.reload();
    };

    // --- 5. ФУНКЦИИ АККАУНТА ---
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
        pushNotification('Безопасность', user.value.isBlocked ? 'Карта заблокирована' : 'Карта разблокирована', 'security');
        save();
    };

    // --- 6. ФУНКЦИИ ДЕПОЗИТА ---
    const openDeposit = (data) => {
        if (user.value.isBlocked) throw new Error('Карта заблокирована');
        if (user.value.deposits.length >= 5) throw new Error('Максимум 5 депозитов');
        const numAmount = Number(data.amount);
        if (user.value.balance >= numAmount) {
            user.value.balance -= numAmount;
            user.value.deposits.push({ 
                id: Date.now(), amount: numAmount, title: data.title, type: data.type, 
                rate: data.rate, canWithdraw: data.type !== 'strict', isAmountHidden: false, createdAt: Date.now()
            });
            pushNotification('Депозит', `Открыт вклад: ${data.title}`, 'deposit');
            addTransaction({ title: `Открытие: ${data.title}`, amount: numAmount, type: 'expense', category: 'deposit' });
            save();
        } else throw new Error('Недостаточно средств');
    };

    const replenishDeposit = (id, amount) => {
        const num = Number(amount);
        const dep = user.value.deposits.find(d => d.id == id);
        if (user.value.balance >= num) {
            user.value.balance -= num;
            dep.amount += num;
            pushNotification('Пополнение', `Вклад "${dep.title}" пополнен`, 'deposit');
            save();
        }
    };

    const withdrawToCard = (id, amount) => {
        const num = Number(amount);
        const dep = user.value.deposits.find(d => d.id == id);
        if (dep.amount - num > 0 && dep.amount - num < 1000) throw new Error('Неснижаемый остаток — 1000 ₸.');
        if (dep.amount >= num) {
            dep.amount -= num;
            user.value.balance += num;
            pushNotification('Снятие', `С вклада "${dep.title}" снято ${num} ₸`, 'deposit');
            save();
        }
    };

    const closeDeposit = (id) => {
        const index = user.value.deposits.findIndex(d => d.id == id);
        const amount = user.value.deposits[index].amount;
        user.value.balance += amount;
        pushNotification('Вклад закрыт', 'Деньги возвращены на карту', 'deposit');
        user.value.deposits.splice(index, 1);
        save();
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

    // --- 7. КРЕДИТЫ ---
    const applyLoan = (data) => {
        const amount = Number(data.amount);
        user.value.balance += amount;
        user.value.credits.push({
            id: Date.now(), amount, remainingDebt: Math.round(amount * 1.2), 
            monthlyPayment: Math.round((amount * 1.2) / data.months), months: data.months, monthsLeft: data.months, rate: 20
        });
        pushNotification('Кредит', `Зачислено ${amount} ₸`, 'loan');
        addTransaction({ title: 'Кредит', amount, type: 'income', category: 'loan' });
        save();
    };

    const repayLoan = (loanId, amount, isFull = false) => {
        const num = Number(amount);
        if (user.value.balance < num) throw new Error('Недостаточно средств');
        const loan = user.value.credits.find(c => c.id === loanId);
        user.value.balance -= num;
        if (isFull) user.value.credits = [];
        else { loan.remainingDebt -= num; loan.monthsLeft -= 1; }
        pushNotification('Кредит', 'Платеж внесен', 'loan');
        addTransaction({ title: 'Платеж по кредиту', amount: num, type: 'expense', category: 'loan' });
        save();
    };

    // --- 8. ПЛАТЕЖИ И ПЕРЕВОДЫ ---
    const processPayment = (amount, title = 'Платеж', category = 'payment', target = 'Поставщик') => {
        const num = Number(amount);
        if (user.value.balance >= num) {
            user.value.balance -= num;
            addTransaction({ title, amount: num, type: 'expense', category, target });
            pushNotification('Платеж', `Оплачено: ${title}`, 'transaction');
            save();
        } else throw new Error('Недостаточно средств');
    };

    const topUpBalance = (amount) => {
        const num = Number(amount);
        user.value.balance += num;
        addTransaction({ title: 'Пополнение', amount: num, type: 'income', category: 'topup' });
        pushNotification('Баланс', `Пополнение на ${num} ₸`, 'transaction');
        save();
    };

    const executeTransfer = (data) => {
        const num = Number(data.amount);
        if (user.value.balance >= num) {
            user.value.balance -= num;
            addTransaction({ title: data.title, amount: num, type: 'expense', category: 'transfer', target: data.target });
            pushNotification('Перевод', `Выполнено: ${num} ₸`, 'transaction');
            save();
        } else throw new Error('Недостаточно средств');
    };

    // --- 9. ADAM BOT ЛОГИКА ---
    const getAIResponse = async (text) => {
    await new Promise(r => setTimeout(r, 1200)); // Имитация раздумий
    const t = text.toLowerCase();
    const userName = user.value?.name.split(' ')[1] || 'клиент';

    // 1. ПРИВЕТСТВИЕ
    if (t.includes('привет') || t.includes('салам') || t.includes('здравствуй')) {
        return `Саламалейкум, ${userName}! Я Adam AI. Чем могу помочь? Могу проверить баланс, рассказать о кредитах или найти твои реквизиты.`;
    }

    // 2. БАЛАНС
    if (t.includes('баланс') || t.includes('деньги') || t.includes('сколько')) {
        return `На твоей карте ADAM Card сейчас: ${user.value.balance} ₸. Не густо, но и не пусто! 😉`;
    }

    // 3. КРЕДИТЫ
    if (t.includes('кредит') || t.includes('долг')) {
        if (user.value.credits?.length > 0) {
            const loan = user.value.credits[0];
            return `У тебя есть активный кредит. Остаток долга: ${loan.remainingDebt} ₸. Ежемесячный платеж: ${loan.monthlyPayment} ₸.`;
        }
        return `Кредитов у тебя нет. Но я могу оформить до 5 000 000 ₸ прямо сейчас под 18%. Рискнем?`;
    }

    // 4. ДЕПОЗИТЫ
    if (t.includes('депозит') || t.includes('вклад') || t.includes('копилка')) {
        if (user.value.deposits?.length > 0) {
            const depCount = user.value.deposits.length;
            const totalDep = user.value.deposits.reduce((acc, d) => acc + d.amount, 0);
            return `У тебя открыто ${depCount} депозита(ов) на общую сумму ${totalDep} ₸. Ставка по ним отличная — до 22% ГЭСВ.`;
        }
        return `Депозитов пока нет. А зря! В ADAM BANK деньги растут быстрее: до 22% годовых. Откроем?`;
    }

    // 5. ДАННЫЕ КАРТЫ И РЕКВИЗИТЫ
    if (t.includes('карт') || t.includes('номер') || t.includes('iban') || t.includes('реквизиты')) {
        return `Твоя карта: ${user.value.card_number}. Срок: ${user.value.card_exp}. Твой IBAN для переводов: ${user.value.iban || 'KZ99ADAM777...'}.`;
    }

    // 6. ПЕРСОНАЛЬНЫЕ ДАННЫЕ (ИИН)
    if (t.includes('иин') || t.includes('документ')) {
        return `Твой ИИН: ${user.value.iin}. Он надежно защищен нашей системой биометрии.`;
    }

    // 7. БЕЗОПАСНОСТЬ (БЛОКИРОВКА)
    if (t.includes('заблокир') || t.includes('потерял') || t.includes('украли') || t.includes('стоп')) {
        return `Брат, если что-то случилось, ты можешь заблокировать карту в разделе "Мой Банк" кнопкой "Блок". Сделать это сейчас? (Шучу, я просто бот, нажми кнопку сам для безопасности!)`;
    }

    // 8. ЧТО ТАКОЕ ADAM BANK?
    if (t.includes('банк') || t.includes('кто вы') || t.includes('adam')) {
        return `ADAM BANK — это самый инновационный цифровой банк в Казахстане. Мы сделали Face ID, умную историю и вот этого бота специально для твоего удобства.`;
    }

    // 9. ПОМОЩЬ / КОМАНДЫ
    if (t.includes('помощь') || t.includes('что ты можешь') || t.includes('команды')) {
        return `Я знаю всё о твоих финансах! Спрашивай про: баланс, кредит, депозиты, ИИН, данные карты. Также могу просто поболтать.`;
    }

    // 10. ФОЛБЭК (Если не понял)
    const answers = [
        "Интересно загнул, но я пока этого не умею. Спроси лучше про баланс или кредит.",
        "Брат, я всего лишь бот, а не философ. Давай по делу: деньги, карты, переводы?",
        "Не совсем понял запрос. Напиши 'Помощь', чтобы увидеть, в чем я силен.",
        `Я пока учусь, ${userName}. Могу подсказать, сколько у тебя денег на счету. Проверим?`
    ];
    return answers[Math.floor(Math.random() * answers.length)];
};

    const sendToAI = async (userText) => {
        chatMessages.value.push({ id: Date.now(), role: 'user', text: userText, date: new Date().toLocaleTimeString() });
        saveChat();
        isTyping.value = true;
        const response = await getAIResponse(userText);
        chatMessages.value.push({ id: Date.now()+1, role: 'bot', text: response, date: new Date().toLocaleTimeString() });
        isTyping.value = false;
        saveChat();
    };

    return { 
        user, token, isWinterMode, isDarkMode, isTyping, notifications, chatMessages,
        register, login, logout, toggleDarkMode, toggleWinterMode, toggleBlockCard, 
        openDeposit, repayLoan, replenishDeposit, withdrawToCard, closeDeposit, renameDeposit, toggleDepVisibility,
        topUpBalance, processPayment, executeTransfer, checkAutoCloseRule, updateAvatar, sendToAI, saveChat
    };
});