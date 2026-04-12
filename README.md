# Scribe

Расширение для Chrome, которое добавляет удобный редактор для работы с большими текстами прямо во ВКонтакте.

## Возможности

- 📝 Редактирование сообщений в двухпанельном режиме (исходник ↔ редактор)
- 📊 Статистика текста: символы, слова, лимит ВК (4096)
- 💾 Автосохранение черновиков для каждого сообщения
- 🔍 Поиск и замена

## Установка

1. Скачай последнюю версию из [Releases](../../releases)
2. Открой `chrome://extensions`
3. Включи «Режим разработчика»
4. Нажми «Загрузить распакованное расширение» и выбери папку `dist`

## Стек

**Chrome Extension** — Manifest V3, service worker, content script с MutationObserver для отслеживания новых сообщений в ленте.

**Frontend** — Vue 3 (Composition API) + TypeScript. Компонентная архитектура: `SourcePanel` и `EditorPanel` независимы и не знают друг о друге — общаются через Pinia store.

**UI** — Naive UI с тёмной темой. Никакой кастомной дизайн-системы — готовые компоненты там, где они уместны.

**State** — Pinia. Store `useMessageStore` намеренно изолирует источник данных: сейчас это `loadFromUrl()` (параметры передаёт background.js через URL), но метод легко заменить на `loadFromApi()` без изменения компонентов — задел на вынос редактора как отдельного веб-приложения.

**Сборка** — Vite 5 + `@crxjs/vite-plugin` v2. CRXJS берёт на себя бандлинг скриптов расширения и HMR в dev-режиме. Нюанс: HTML-страницы из `web_accessible_resources` CRXJS v2 не обрабатывает как Vite entry — редактор подключён явно через `build.rollupOptions.input`.

## Структура

```
src/
├── background/index.ts        # Service worker: открытие вкладок, роутинг сообщений
├── content/index.ts           # Инжект иконок на vk.com, вставка ответа в редактор VK
├── editor/
│   ├── App.vue                # Корень: тема + двухколоночный layout
│   ├── components/
│   │   ├── SourcePanel.vue    # Исходное сообщение (read-only)
│   │   └── EditorPanel.vue    # Редактор ответа + отправка
│   └── stores/message.ts      # Pinia: текст, vkTabId, статистика
└── types/messages.ts          # Общие типы chrome.runtime сообщений
```

## Запуск

```bash
npm install
npm run build       # сборка → dist/
npm run dev         # dev-режим с HMR
npm run type-check  # только проверка типов
```

Загрузка в Chrome: `chrome://extensions/` → Developer mode → **Load unpacked** → папка `dist/`.
