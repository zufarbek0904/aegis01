import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ru' | 'en' | 'uk' | 'de' | 'fr';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Settings
  'settings.title': { ru: 'Настройки', en: 'Settings', uk: 'Налаштування', de: 'Einstellungen', fr: 'Paramètres' },
  'settings.profile': { ru: 'Профиль', en: 'Profile', uk: 'Профіль', de: 'Profil', fr: 'Profil' },
  'settings.notifications': { ru: 'Уведомления', en: 'Notifications', uk: 'Сповіщення', de: 'Benachrichtigungen', fr: 'Notifications' },
  'settings.privacy': { ru: 'Приватность', en: 'Privacy', uk: 'Приватність', de: 'Datenschutz', fr: 'Confidentialité' },
  'settings.appearance': { ru: 'Оформление', en: 'Appearance', uk: 'Оформлення', de: 'Erscheinungsbild', fr: 'Apparence' },
  'settings.devices': { ru: 'Устройства', en: 'Devices', uk: 'Пристрої', de: 'Geräte', fr: 'Appareils' },
  'settings.language': { ru: 'Язык', en: 'Language', uk: 'Мова', de: 'Sprache', fr: 'Langue' },
  'settings.storage': { ru: 'Хранилище', en: 'Storage', uk: 'Сховище', de: 'Speicher', fr: 'Stockage' },
  'settings.help': { ru: 'Помощь', en: 'Help', uk: 'Допомога', de: 'Hilfe', fr: 'Aide' },
  'settings.logout': { ru: 'Выйти', en: 'Log out', uk: 'Вийти', de: 'Abmelden', fr: 'Déconnexion' },
  
  // Notifications
  'notifications.messages': { ru: 'Уведомления о сообщениях', en: 'Message notifications', uk: 'Сповіщення про повідомлення', de: 'Nachrichtenbenachrichtigungen', fr: 'Notifications de messages' },
  'notifications.messages.desc': { ru: 'Получать уведомления о новых сообщениях', en: 'Receive notifications for new messages', uk: 'Отримувати сповіщення про нові повідомлення', de: 'Benachrichtigungen für neue Nachrichten erhalten', fr: 'Recevoir des notifications pour les nouveaux messages' },
  'notifications.sounds': { ru: 'Звук уведомлений', en: 'Notification sounds', uk: 'Звук сповіщень', de: 'Benachrichtigungstöne', fr: 'Sons de notification' },
  'notifications.sounds.desc': { ru: 'Воспроизводить звук при получении сообщений', en: 'Play sound when receiving messages', uk: 'Відтворювати звук при отриманні повідомлень', de: 'Ton abspielen beim Empfang von Nachrichten', fr: 'Jouer un son lors de la réception de messages' },
  'notifications.preview': { ru: 'Предпросмотр сообщений', en: 'Message preview', uk: 'Попередній перегляд повідомлень', de: 'Nachrichtenvorschau', fr: 'Aperçu des messages' },
  'notifications.preview.desc': { ru: 'Показывать текст сообщения в уведомлении', en: 'Show message text in notification', uk: 'Показувати текст повідомлення в сповіщенні', de: 'Nachrichtentext in Benachrichtigung anzeigen', fr: 'Afficher le texte du message dans la notification' },
  'notifications.vibration': { ru: 'Вибрация', en: 'Vibration', uk: 'Вібрація', de: 'Vibration', fr: 'Vibration' },
  'notifications.vibration.desc': { ru: 'Вибрировать при получении уведомлений', en: 'Vibrate when receiving notifications', uk: 'Вібрувати при отриманні сповіщень', de: 'Vibrieren beim Empfang von Benachrichtigungen', fr: 'Vibrer lors de la réception de notifications' },
  
  // Privacy
  'privacy.showOnline': { ru: 'Показывать онлайн статус', en: 'Show online status', uk: 'Показувати онлайн статус', de: 'Online-Status anzeigen', fr: 'Afficher le statut en ligne' },
  'privacy.showOnline.desc': { ru: 'Другие пользователи увидят когда вы онлайн', en: 'Other users will see when you are online', uk: 'Інші користувачі побачать коли ви онлайн', de: 'Andere Benutzer sehen, wann Sie online sind', fr: "D'autres utilisateurs verront quand vous êtes en ligne" },
  'privacy.showLastSeen': { ru: 'Показывать последний визит', en: 'Show last seen', uk: 'Показувати останній візит', de: 'Zuletzt gesehen anzeigen', fr: 'Afficher la dernière visite' },
  'privacy.showLastSeen.desc': { ru: 'Другие увидят когда вы были онлайн', en: 'Others will see when you were online', uk: 'Інші побачать коли ви були онлайн', de: 'Andere sehen, wann Sie online waren', fr: 'Les autres verront quand vous étiez en ligne' },
  'privacy.showReadReceipts': { ru: 'Показывать прочтение', en: 'Show read receipts', uk: 'Показувати прочитання', de: 'Lesebestätigungen anzeigen', fr: 'Afficher les confirmations de lecture' },
  'privacy.showReadReceipts.desc': { ru: 'Отправители увидят что вы прочитали сообщение', en: 'Senders will see that you read the message', uk: 'Відправники побачать що ви прочитали повідомлення', de: 'Absender sehen, dass Sie die Nachricht gelesen haben', fr: 'Les expéditeurs verront que vous avez lu le message' },
  'privacy.whoCanMessage': { ru: 'Кто может отправлять сообщения', en: 'Who can send messages', uk: 'Хто може надсилати повідомлення', de: 'Wer kann Nachrichten senden', fr: 'Qui peut envoyer des messages' },
  'privacy.whoCanCall': { ru: 'Кто может звонить', en: 'Who can call', uk: 'Хто може дзвонити', de: 'Wer kann anrufen', fr: 'Qui peut appeler' },
  'privacy.everyone': { ru: 'Все', en: 'Everyone', uk: 'Усі', de: 'Alle', fr: 'Tout le monde' },
  'privacy.contacts': { ru: 'Только контакты', en: 'Contacts only', uk: 'Тільки контакти', de: 'Nur Kontakte', fr: 'Contacts uniquement' },
  'privacy.nobody': { ru: 'Никто', en: 'Nobody', uk: 'Ніхто', de: 'Niemand', fr: 'Personne' },
  
  // Appearance
  'appearance.darkTheme': { ru: 'Тёмная тема', en: 'Dark theme', uk: 'Темна тема', de: 'Dunkles Thema', fr: 'Thème sombre' },
  'appearance.darkTheme.desc': { ru: 'Использовать тёмное оформление', en: 'Use dark appearance', uk: 'Використовувати темне оформлення', de: 'Dunkles Erscheinungsbild verwenden', fr: 'Utiliser un thème sombre' },
  'appearance.colorScheme': { ru: 'Цветовая схема', en: 'Color scheme', uk: 'Кольорова схема', de: 'Farbschema', fr: 'Schéma de couleurs' },
  'appearance.fontSize': { ru: 'Размер шрифта', en: 'Font size', uk: 'Розмір шрифту', de: 'Schriftgröße', fr: 'Taille de la police' },
  
  // Devices
  'devices.current': { ru: 'Текущее устройство', en: 'Current device', uk: 'Поточний пристрій', de: 'Aktuelles Gerät', fr: 'Appareil actuel' },
  'devices.active': { ru: 'Активно', en: 'Active', uk: 'Активно', de: 'Aktiv', fr: 'Actif' },
  'devices.lastActivity': { ru: 'Последняя активность', en: 'Last activity', uk: 'Остання активність', de: 'Letzte Aktivität', fr: 'Dernière activité' },
  'devices.terminateAll': { ru: 'Завершить все другие сессии', en: 'Terminate all other sessions', uk: 'Завершити всі інші сесії', de: 'Alle anderen Sitzungen beenden', fr: 'Terminer toutes les autres sessions' },
  
  // Storage
  'storage.used': { ru: 'Использовано', en: 'Used', uk: 'Використано', de: 'Verwendet', fr: 'Utilisé' },
  'storage.photos': { ru: 'Фотографии', en: 'Photos', uk: 'Фотографії', de: 'Fotos', fr: 'Photos' },
  'storage.videos': { ru: 'Видео', en: 'Videos', uk: 'Відео', de: 'Videos', fr: 'Vidéos' },
  'storage.documents': { ru: 'Документы', en: 'Documents', uk: 'Документи', de: 'Dokumente', fr: 'Documents' },
  'storage.voice': { ru: 'Голосовые сообщения', en: 'Voice messages', uk: 'Голосові повідомлення', de: 'Sprachnachrichten', fr: 'Messages vocaux' },
  'storage.clearCache': { ru: 'Очистить кеш', en: 'Clear cache', uk: 'Очистити кеш', de: 'Cache leeren', fr: 'Vider le cache' },
  
  // Help
  'help.faq': { ru: 'Часто задаваемые вопросы', en: 'Frequently asked questions', uk: 'Часті питання', de: 'Häufig gestellte Fragen', fr: 'Questions fréquemment posées' },
  'help.faq.desc': { ru: 'Ответы на популярные вопросы', en: 'Answers to popular questions', uk: 'Відповіді на популярні питання', de: 'Antworten auf häufige Fragen', fr: 'Réponses aux questions populaires' },
  'help.support': { ru: 'Связаться с поддержкой', en: 'Contact support', uk: "Зв'язатися з підтримкою", de: 'Support kontaktieren', fr: 'Contacter le support' },
  'help.support.desc': { ru: 'Напишите нам если есть проблемы', en: 'Write to us if you have problems', uk: 'Напишіть нам якщо є проблеми', de: 'Schreiben Sie uns, wenn Sie Probleme haben', fr: 'Écrivez-nous si vous avez des problèmes' },
  'help.privacy': { ru: 'Политика конфиденциальности', en: 'Privacy policy', uk: 'Політика конфіденційності', de: 'Datenschutzrichtlinie', fr: 'Politique de confidentialité' },
  'help.privacy.desc': { ru: 'Как мы защищаем ваши данные', en: 'How we protect your data', uk: 'Як ми захищаємо ваші дані', de: 'Wie wir Ihre Daten schützen', fr: 'Comment nous protégeons vos données' },
  
  // Profile
  'profile.changePicture': { ru: 'Изменить фото', en: 'Change photo', uk: 'Змінити фото', de: 'Foto ändern', fr: 'Changer la photo' },
  'profile.name': { ru: 'Имя', en: 'Name', uk: "Ім'я", de: 'Name', fr: 'Nom' },
  'profile.username': { ru: 'Имя пользователя', en: 'Username', uk: "Ім'я користувача", de: 'Benutzername', fr: "Nom d'utilisateur" },
  'profile.bio': { ru: 'О себе', en: 'Bio', uk: 'Про себе', de: 'Über mich', fr: 'Biographie' },
  'profile.notSpecified': { ru: 'Не указано', en: 'Not specified', uk: 'Не вказано', de: 'Nicht angegeben', fr: 'Non spécifié' },
  'profile.edit': { ru: 'Редактировать профиль', en: 'Edit profile', uk: 'Редагувати профіль', de: 'Profil bearbeiten', fr: 'Modifier le profil' },
  
  // Chat
  'chat.newChat': { ru: 'Новый чат', en: 'New chat', uk: 'Новий чат', de: 'Neuer Chat', fr: 'Nouveau chat' },
  'chat.createGroup': { ru: 'Создать группу', en: 'Create group', uk: 'Створити групу', de: 'Gruppe erstellen', fr: 'Créer un groupe' },
  'chat.searchUsers': { ru: 'Поиск пользователей...', en: 'Search users...', uk: 'Пошук користувачів...', de: 'Benutzer suchen...', fr: 'Rechercher des utilisateurs...' },
  'chat.noUsersFound': { ru: 'Пользователи не найдены', en: 'No users found', uk: 'Користувачів не знайдено', de: 'Keine Benutzer gefunden', fr: 'Aucun utilisateur trouvé' },
  'chat.noAvailableUsers': { ru: 'Нет доступных пользователей', en: 'No available users', uk: 'Немає доступних користувачів', de: 'Keine verfügbaren Benutzer', fr: "Aucun utilisateur disponible" },
  'chat.upTo200': { ru: 'До 200 участников', en: 'Up to 200 members', uk: 'До 200 учасників', de: 'Bis zu 200 Mitglieder', fr: "Jusqu'à 200 membres" },
  'chat.search': { ru: 'Поиск', en: 'Search', uk: 'Пошук', de: 'Suche', fr: 'Recherche' },
  'chat.chatsNotFound': { ru: 'Чаты не найдены', en: 'Chats not found', uk: 'Чати не знайдено', de: 'Keine Chats gefunden', fr: 'Aucun chat trouvé' },
  'chat.loading': { ru: 'Загрузка...', en: 'Loading...', uk: 'Завантаження...', de: 'Laden...', fr: 'Chargement...' },
  'chat.typeMessage': { ru: 'Написать сообщение...', en: 'Type a message...', uk: 'Написати повідомлення...', de: 'Nachricht eingeben...', fr: 'Tapez un message...' },
  
  // Common
  'common.user': { ru: 'Пользователь', en: 'User', uk: 'Користувач', de: 'Benutzer', fr: 'Utilisateur' },
  'common.now': { ru: 'сейчас', en: 'now', uk: 'зараз', de: 'jetzt', fr: 'maintenant' },
  'common.online': { ru: 'в сети', en: 'online', uk: 'в мережі', de: 'online', fr: 'en ligne' },
  'common.offline': { ru: 'не в сети', en: 'offline', uk: 'не в мережі', de: 'offline', fr: 'hors ligne' },
  'common.recently': { ru: 'недавно', en: 'recently', uk: 'нещодавно', de: 'kürzlich', fr: 'récemment' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; native: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation['en'] || key;
  };

  const languages = [
    { code: 'ru' as Language, name: 'Russian', native: 'Русский' },
    { code: 'en' as Language, name: 'English', native: 'English' },
    { code: 'uk' as Language, name: 'Ukrainian', native: 'Українська' },
    { code: 'de' as Language, name: 'German', native: 'Deutsch' },
    { code: 'fr' as Language, name: 'French', native: 'Français' },
  ];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
