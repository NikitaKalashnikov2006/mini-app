// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
let tonConnectUI = null;

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
  // Развертываем WebApp на весь экран
  tg.expand();
  
  // Устанавливаем данные пользователя
  setUserData();
  
  // Инициализация TON Connect (только когда нужен)
  initTonConnect();
  
  // Обработчики для кнопок навигации
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      showPage(page);
    });
  });
  
  // Обработчик для кнопки "Симулятор биржи"
  const exchangeSimulatorBtn = document.getElementById('exchangeSimulator');
  if (exchangeSimulatorBtn) {
    exchangeSimulatorBtn.addEventListener('click', () => {
      showPage('wallet');
    });
  }
  
  // Обработчик для кнопки "Пригласить друга"
  const inviteFriendBtn = document.getElementById('inviteFriend');
  if (inviteFriendBtn) {
    inviteFriendBtn.addEventListener('click', () => {
      const modal = document.getElementById('inviteModal');
      if (modal) modal.style.display = 'flex';
    });
  }
  
  // Обработчики для модального окна приглашения
  const sendInviteBtn = document.getElementById('sendInviteBtn');
  if (sendInviteBtn) {
    sendInviteBtn.addEventListener('click', sendInvite);
  }
  
  const copyInviteBtn = document.getElementById('copyInviteBtn');
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', copyInviteLink);
  }
  
  // Закрытие модального окна при клике вне его
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('inviteModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Обработчики для кнопок уроков
  document.querySelectorAll('.lesson-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lessonId = e.currentTarget.dataset.lesson;
      showLesson(lessonId);
    });
  });
  
  // Показываем начальную страницу из hash или home
  const hash = window.location.hash.substring(1) || 'home';
  showPage(hash);
});

// Функция для установки данных пользователя
function setUserData() {
  const user = tg.initDataUnsafe.user;
  if (user) {
    // Устанавливаем аватар
    const avatarContainer = document.querySelector('.user-avatar');
    if (user.photo_url) {
      avatarContainer.src = user.photo_url;
    } else {
      avatarContainer.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    }
    
    // Устанавливаем имя пользователя
    const userNameElement = document.querySelector('.userName');
    if (user.username) {
      userNameElement.textContent = `@${user.username}`;
    } else if (user.first_name || user.last_name) {
      userNameElement.textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    } else {
      userNameElement.textContent = 'Пользователь';
    }
  }
}

// Функция показа страницы
function showPage(page) {
  // Скрываем все страницы
  document.querySelectorAll('.page').forEach(p => {
    p.classList.add('hidden-page');
    p.classList.remove('active-page');
  });
  
  // Показываем выбранную страницу
  const activePage = document.getElementById(`${page}-page`);
  if (activePage) {
    activePage.classList.remove('hidden-page');
    activePage.classList.add('active-page');
  } else {
    // Если страница не найдена, показываем home
    document.getElementById('home-page').classList.remove('hidden-page');
    document.getElementById('home-page').classList.add('active-page');
    page = 'home';
  }
  
  // Обновляем активную кнопку в навигации
  updateActiveButton(page);
  
  // Обновляем URL
  history.pushState({ page }, "", `#${page}`);
  
  // Если показываем кошелёк, инициализируем TON Connect
  if (page === 'wallet') {
    initTonConnect();
  }
  
  // Загружаем список рефералов для страницы друзей
  if (page === 'friends') {
    loadReferralsList();
  }
}

// Функция для отображения урока
function showLesson(lessonId) {
  // В реальном приложении здесь можно загружать контент урока
  // Сейчас просто покажем alert для демонстрации
  alert(`Открываем урок: ${lessonId}`);
  
  // Пример реализации с контентом уроков:
  /*
  const lessonContent = {
    lesson1: {
      title: "Основы инвестирования",
      text: "Контент урока 1..."
    },
    // другие уроки
  };
  
  if (lessonContent[lessonId]) {
    // Показываем контент урока
  }
  */
}

// Функция для отправки приглашения
function sendInvite() {
    try {
  const userId = tg.initDataUnsafe.user?.id || '0';
    const botUsername = 'Business_shop_bot';
    const appName = 'test';
    
    const refLink = `https://t.me/${botUsername}/${appName}?startapp=ref_${userId}`;
    const shareText = `🚀 Присоединяйся к проекту!`;
    
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(shareText)}`;
    
    console.log('Отправляем ссылку:', shareUrl);
    
    tg.openTelegramLink(shareUrl);
    
  } catch (error) {
    console.error('Ошибка:', error);
    tg.showAlert(`Скопируйте ссылку вручную:\nhttps://t.me/${botUsername}?start=ref_${userId}`);
  }}

  // Закрываем модальное окно
  const modal = document.getElementById('inviteModal');
  if (modal) modal.style.display = 'none';

// Функция для копирования ссылки приглашения
function copyInviteLink() {
  const userId = tg.initDataUnsafe.user?.id || '0';
  const botUsername = 'Business_shop_bot';
  const appName = 'test';
  const refLink = `https://t.me/${botUsername}/${appName}?startapp=ref_${userId}`;
  
  navigator.clipboard.writeText(refLink).then(() => {
    showCopiedNotification();
  }).catch(err => {
    console.error('Не удалось скопировать ссылку:', err);
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = refLink;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopiedNotification();
  });
  
  // Закрываем модальное окно
  const modal = document.getElementById('inviteModal');
  if (modal) modal.style.display = 'none';
}

// Функция для показа уведомления "Скопировано!"
function showCopiedNotification() {
  const notification = document.createElement('div');
  notification.className = 'copied-notification';
  notification.textContent = 'Скопировано!';
  document.body.appendChild(notification);
  
  // Удаляем уведомление через 2 секунды
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 2000);
}

// Функция для загрузки списка рефералов
function loadReferralsList() {
  const referralsContainer = document.getElementById('referralsContainer');
  if (!referralsContainer) return;

  // Здесь должен быть запрос к вашему бэкенду
  // Для демонстрации используем пустой список
  const referrals = [
    { username: 'user1', profit: 15.50 },
    { username: 'user2', profit: 8.20 },
    { username: 'user3', profit: 3.75 },
    { username: 'user4', profit: 3.75 },
    { username: 'user5', profit: 3.75 },
    { username: 'user6', profit: 3.75 },
    { username: 'user7', profit: 3.75 },
    { username: 'user8', profit: 3.75 },
    { username: 'user9', profit: 3.75 },
    { username: 'user9', profit: 3.75 }
  ];
  
  // Очищаем контейнер
  referralsContainer.innerHTML = '';
  
  if (referrals.length === 0) {
    referralsContainer.innerHTML = '<div class="empty-list">Пока нет приглашённых друзей</div>';
    return;
  }
  
  // Добавляем рефералов в список
  referrals.forEach(ref => {
    const referralItem = document.createElement('div');
    referralItem.className = 'referral-item';
    referralItem.innerHTML = `
      <span class="referral-username">@${ref.username}</span>
      <span class="referral-profit">+${ref.profit.toFixed(2)}</span>
    `;
    referralsContainer.appendChild(referralItem);
  });
  
  // Обновляем статистику
  updateReferralStats(referrals);
}

// Функция для обновления статистики рефералов
function updateReferralStats(referrals) {
  const totalReferrals = referrals.length;
  const totalProfit = referrals.reduce((sum, ref) => sum + ref.profit, 0);
  
  const statItems = document.querySelectorAll('.stat-item .stat-value');
  if (statItems.length >= 2) {
    statItems[0].textContent = totalReferrals;
    statItems[1].textContent = totalProfit.toFixed(2);
  }
}

// Функция для обновления активной кнопки
function updateActiveButton(page) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// Инициализация TON Connect
function initTonConnect() {
  if (!tonConnectUI && document.getElementById('ton-connect')) {
    tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
      manifestUrl: 'https://nikitakalashnikov2006.github.io/shop/manifest-tonconnect.json',
      buttonRootId: 'ton-connect',
      uiOptions: {
        twaReturnUrl: 'https://t.me/Business_shop_bot/App'
      }
    });

    const sendBtn = document.getElementById('send-btn');
    const amountInput = document.getElementById('amount');
    const amountError = document.getElementById('amount-error');

    function isValidNumber(value) {
      if (value === '' || value === '.') return false;
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num) && num > 0;
    }

    function updateButtonState() {
      const isConnected = tonConnectUI && tonConnectUI.wallet;
      const isValid = isValidNumber(amountInput.value);
      sendBtn.disabled = !isConnected || !isValid;
    }

    amountInput.addEventListener('input', function(e) {
      let value = e.target.value;
      value = value
        .replace(/[^0-9.,]/g, '')
        .replace(/,/g, '.');
      
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      e.target.value = value;
      
      if (isValidNumber(value)) {
        amountInput.classList.remove('error');
        amountError.style.display = 'none';
      } else {
        amountInput.classList.add('error');
        amountError.style.display = 'block';
      }
      
      updateButtonState();
    });

    if (tonConnectUI) {
      tonConnectUI.onStatusChange((wallet) => {
        updateButtonState();
      });
    }

    sendBtn.addEventListener('click', async () => {
      const amount = parseFloat(amountInput.value);
      
      if (!isValidNumber(amountInput.value)) {
        amountInput.classList.add('error');
        amountError.style.display = 'block';
        return;
      }

      const nanotons = Math.round(amount * 1000000000).toString();

      try {
        const transaction = {
          validUntil: Math.floor(Date.now() / 1000) + 300,
          messages: [
            {
              address: "0QD0LFy2lUH2LXI6y9-Xl9Ao6ZkEdgwpd-91V828VVFGrCzG",
              amount: nanotons
            }
          ]
        };

        await tonConnectUI.sendTransaction(transaction);
      } catch (error) {
        console.error('Transaction error:', error);
      }
    });

    updateButtonState();
    amountInput.dispatchEvent(new Event('input'));
  }
}

// Обработка кнопки "Назад"
window.addEventListener("popstate", (e) => {
  if (e.state?.page) {
    showPage(e.state.page);
  }
});
