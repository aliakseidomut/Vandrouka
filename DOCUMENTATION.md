## Vandrouka – Техническая документация для LLM

### 1. Общий обзор

- **Назначение**: мобильное (Expo React Native) + backend (NestJS + Prisma + PostgreSQL) приложение для регистрации пользователей и планирования туристических поездок.
- **Основной пользовательский поток**:
  1. Регистрация или логин.
  2. Переход в табы приложения.
  3. Создание туристической поездки (город + достопримечательности).
  4. Просмотр сохранённых поездок.
  5. Профиль пользователя (email, настройки, выход).

---

### 2. Структура проекта

- **Корень репозитория**
  - `client/` – фронтенд (Expo / React Native, expo-router).
  - `server/` – backend (NestJS, REST API, Prisma + PostgreSQL).

#### 2.1. Клиент (`client/`)

- **Основные файлы и директории**
  - `app.json` – конфигурация Expo.
  - `src/`
    - `api/`
      - `auth.ts` – HTTP-клиент для регистрации/логина и Google-регистрации.
      - `trips.ts` – HTTP-клиент для создания и получения поездок.
    - `app/` – дерево экранов expo-router.
      - `_layout.tsx` – корневой Stack-навигатор:
        - Стэк `(auth)` – экраны авторизации.
        - Стэк `(tabs)` – таб-навигатор после авторизации.
      - `(auth)/`
        - `_layout.tsx` – стек авторизации (`login`, `register`), без header.
        - `login.tsx` – страница логина, рендерит компонент `LoginScreen`.
        - `register.tsx` – страница регистрации, рендерит `RegisterScreenWithGoogle`.
      - `(tabs)/`
        - `_layout.tsx` – табы `Trips` (главный экран) и `Profile`.
        - `index.tsx` – главный экран с списком поездок пользователя и плавающей кнопкой `+` для создания новой поездки.
        - `trips.tsx` – экран создания поездки (выбор города и достопримечательностей).
        - `profile.tsx` – экран профиля пользователя.
    - `components/`
      - `login-screen.tsx` – UI и логика логина.
      - `register-screen-with-google.tsx` – UI и логика регистрации по email/паролю (и задел под Google).
      - `themed-text.tsx`, `themed-view.tsx` – обёртки для текстов и контейнеров с учётом темы.
      - `app-tabs.tsx` – альтернативная/примерная реализация табов (не основной вход).
      - другие UI-компоненты: анимированные иконки, web-badge и т.д.
    - `constants/theme.ts` – палитра цветов, шрифты, отступы.
    - `hooks/` – хуки темы (`use-theme`, `use-color-scheme` и т.д.).

#### 2.2. Сервер (`server/`)

- **Основные файлы**
  - `src/main.ts` – точка входа NestJS, bootstrap приложения.
  - `src/app.module.ts` – корневой модуль:
    - импортирует `AuthModule`, `UsersModule`, `TripsModule`.
  - `src/auth/` – модуль аутентификации:
    - `auth.controller.ts` – эндпоинты `/api/auth`.
    - `auth.service.ts` – логика регистрации/логина и Google-регистрации.
    - `dto/` – DTO для `RegisterDto`, `LoginDto`.
  - `src/users/` – модуль пользователей (пока практически пустой, только `UsersService`).
  - `src/trips/` – модуль поездок:
    - `trips.controller.ts` – REST-эндпоинты `/api/trips`.
    - `trips.service.ts` – бизнес-логика создания и получения поездок.
    - `trips.module.ts` – модуль Nest для trips.
  - `src/prisma/prisma.service.ts` – сервис доступа к базе через Prisma.
  - `prisma/schema.prisma` – описание моделей БД (`User`, `Trip`).

---

### 3. Backend – модели и API

#### 3.1. Модели Prisma (`server/prisma/schema.prisma`)

- **Модель `User`**
  - Поля: `id`, `email`, `password`, `googleId`, `name`, `picture`, `createdAt`, `updatedAt`.
  - Связь: `trips Trip[]` – один пользователь имеет много поездок.

- **Модель `Trip`**
  - Поля:
    - `id: String @id @default(uuid())`
    - `userId: String` – ссылка на `User`.
    - `city: String` – идентификатор/название города.
    - `attractions: String` – JSON-строка, список id достопримечательностей.
    - `createdAt: DateTime @default(now())`
  - Связь:
    - `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`

#### 3.2. Auth API (`server/src/auth`)

- **`AuthController` (`auth.controller.ts`)**
  - `POST /api/auth/register`
    - Тело: `{ email: string; password: string }`
    - Вызывает `authService.register`.
    - Возвращает: `{ id, email, token }`.
  - `POST /api/auth/login`
    - Тело: `{ email: string; password: string }`
    - Возвращает: `{ id, email, token }`.
  - `POST /api/auth/register-google`
    - Тело: `{ id, email, name?, picture? }`
    - Создаёт или связывает пользователя по Google ID/email.
    - Возвращает: `{ id, email, name, picture, token }`.

- **`AuthService` (`auth.service.ts`)**
  - Использует `PrismaService` и `JwtService`.
  - `register(RegisterDto)`:
    - Проверяет, что email свободен.
    - Хеширует пароль через `bcrypt`.
    - Создаёт пользователя.
    - Генерирует JWT со `sub: user.id, email: user.email`.
  - `login(LoginDto)`:
    - Находит пользователя по email.
    - Сравнивает пароли через `bcrypt.compare`.
    - При успехе возвращает `{ id, email, token }`.
  - `registerWithGoogle(googleData)`:
    - Ищет пользователя по `googleId` или `email`.
    - Создаёт/обновляет пользователя с полями `name`, `picture`.
    - Генерирует JWT и возвращает расширенный payload.

> На текущий момент клиент **не** сохраняет JWT-токен и не использует его при запросах `Trips`. Для LLM это важно: аутентификация реализована на бэке, но не интегрирована в клиент полностью.

#### 3.3. Trips API (`server/src/trips`)

- **`TripsController` (`trips.controller.ts`)**
  - `POST /api/trips`
    - Тело: `{ userId: string; city: string; attractions: string[] }`
    - Делегирует `TripsService.createTrip(userId, city, attractions)`.
    - Возвращает: `{ id, city, attractions: string[], createdAt }`.
  - `GET /api/trips/user/:userId`
    - Возвращает все поездки пользователя, отсортированные по `createdAt DESC`.
  - `DELETE /api/trips/:tripId`
    - Тело: `{ userId: string }`
    - Удаляет поездку, принадлежащую этому пользователю.

- **`TripsService` (`trips.service.ts`)**
  - `createTrip(userId, city, attractions[])`
    - Создаёт запись `Trip` с `attractions` как JSON-строкой.
    - Возвращает нормализованный объект с распарсенным `attractions`.
  - `getUserTrips(userId)`
    - Находит все поездки пользователя.
    - Возвращает массив `{ id, city, attractions: string[], createdAt }`.
  - `deleteTrip(userId, tripId)`
    - Проверяет, что поездка принадлежит пользователю.
    - Удаляет запись.

> Аутентификация в Trips пока упрощена: `userId` приходит явно в теле/параметрах, а не через JWT-guard.

---

### 4. Client – функциональность и экраны

#### 4.1. API-клиенты (`client/src/api`)

- **`AuthAPI` (`auth.ts`)**
  - Внутри определён `API_BASE_URL = <определяется по платформе и EXPO_PUBLIC_API_URL>/api`.
  - `register(email, password)` – `POST /auth/register`.
  - `login(email, password)` – `POST /auth/login`.
  - `registerWithGoogle(googleData)` – `POST /auth/register-google`.
  - При ошибках, если ответ `!ok`, бросает `Error` с `error.message` или дефолтным текстом.

- **`TripsAPI` (`trips.ts`)**
  - Использует ту же логику вычисления `API_BASE_URL`.
  - `createTrip({ userId, city, attractions })`
    - `POST /trips` с соответствующим телом.
  - `getUserTrips(userId)`
    - `GET /trips/user/:userId`.

#### 4.2. Навигация (`client/src/app/_layout.tsx` и `(auth)`, `(tabs)`)

- **Root Stack (`_layout.tsx`)**
  - Оборачивает всё в `ThemeProvider` из `@react-navigation/native`.
  - Стэки:
    - `name="(auth)"` – стартовый стек (логин/регистрация).
    - `name="(tabs)"` – основной стек с табами, без хедера.

- **Auth стек (`(auth)/_layout.tsx`)**
  - `Stack` с `initialRouteName="login"`.
  - Экраны:
    - `login`
    - `register`
  - Оба без header.

- **Tabs (`(tabs)/_layout.tsx`)**
  - Использует `NativeTabs` из `expo-router/unstable-native-tabs`.
  - Табы:
    - `index` – Home.
    - `trips` – экран создания поездки.
    - `profile` – профиль пользователя.

#### 4.3. Экраны авторизации

- **`(auth)/login.tsx` + `LoginScreen`**
  - Оборачивается в `SafeAreaView`, `ScrollView`.
  - `LoginScreen`:
    - Поля: email, password.
    - Валидация: email (обязателен и валидный), password (обязателен).
    - При нажатии "Sign In":
      - вызывает `AuthAPI.login`.
      - при успехе делает `router.push("/(tabs)")`.
      - при ошибке показывает `Alert.alert("Error", message)`.
    - Есть ссылка "Forgot password?" (пока показывает `Alert` о том, что будет позже).
    - Ссылка "Sign Up" ведёт на `/(auth)/register`.

- **`(auth)/register.tsx` + `RegisterScreenWithGoogle`**
  - Аналогично логину, но для регистрации.
  - Поля: email, password, confirmPassword.
  - Валидация:
    - email обязателен, формат.
    - password ≥ 8 символов.
    - confirmPassword совпадает с password.
  - При нажатии "Sign Up":
    - вызывает `AuthAPI.register`.
    - при успехе показывает `Alert` и переводит на `/(tabs)`.
  - Ссылка "Sign In" ведёт на экран логина.

> На данный момент UI говорит о возможной Google-регистрации, но фактически используется только email+password.

#### 4.4. Главный таб Trips (`(tabs)/index.tsx`)

- Экран со списком поездок пользователя:
  - Заголовок “Мои поездки” и подзаголовок с описанием.
  - При загрузке – индикатор прогресса.
  - При отсутствии поездок – пустое состояние с подсказкой создать первую поездку.
  - При наличии поездок – список карточек с названием города и перечнем достопримечательностей.
- Плавающая кнопка в виде круглого “+” в правом нижнем углу:
  - При нажатии выполняет `router.push("/(tabs)/trips")` и открывает экран создания поездки.

#### 4.5. Экран профиля (`(tabs)/profile.tsx`)

- **Функциональность**
  - Отображает:
    - Заголовок `Profile`.
    - `Email` – пока что **мок-значение** `MOCK_EMAIL = "user@example.com"`.
    - Блок `Settings` с текстом “Settings will be available soon.” (пустая заглушка настроек).
  - Кнопка `Log out`:
    - Сейчас просто:
      - показывает `Alert` “Logged out”.
      - делает `router.replace("/(auth)/login")`.
    - **Важно для LLM**: состояние сессии, токен и т.п. пока нигде не очищаются, так как они нигде не сохраняются.

#### 4.6. Экран создания поездки (`(tabs)/trips.tsx`)

- **Моковые данные городов**
  - `MOCK_CITIES`: массив объектов `{ id, name, country, imageUrl, attractions[] }`.
  - Каждая достопримечательность: `{ id, name, imageUrl }`.
  - Структура с `imageUrl` продумана так, чтобы позже легко подставить реальные картинки.

- **Состояние**
  - `selectedCityId: string | null` – выбранный город.
  - `selectedAttractions: string[]` – выбранные достопримечательности.
  - `citySearch: string` – строка поиска по городам.
  - `attractionSearch: string` – строка поиска по достопримечательностям.
  - `saving: boolean` – флаг сохранения.
  - `MOCK_USER_ID = "mock-user-id"` – временный идентификатор пользователя для запросов Trips API.

- **UI и логика**
  - Блок выбора города:
    - Поле поиска (“Поиск города”).
    - Сетка карточек городов (2 в ряд) с картинкой, названием и страной.
    - Выбранный город подсвечивается рамкой и тенью.
  - Блок выбора достопримечательностей (отображается после выбора города):
    - Поле поиска (“Поиск достопримечательностей”).
    - Сетка карточек достопримечательностей с картинкой и названием.
    - Выбранные карточки подсвечиваются и имеют метку “Выбрано”.
  - Кнопка “Сохранить поездку”:
    - Валидирует, что выбран город и хотя бы одна достопримечательность.
    - Вызывает `TripsAPI.createTrip({ userId: MOCK_USER_ID, city: selectedCityId, attractions: selectedAttractions })`.
    - При успехе показывает `Alert` и выполняет `router.back()` (возврат к списку поездок).

> Важно для LLM: Trips сейчас привязаны к **моковому userId** и не синхронизированы с реальным пользователем/его токеном. Это сознательное упрощение текущей версии.

---

### 5. Как это использовать в следующих задачах/LLM

- **Контекст по пользователю**
  - Реальный идентификатор пользователя и токен JWT доступны из ответов `AuthAPI.register/login`.
  - Сейчас они не сохраняются глобально. Следующий шаг – добавить глобальное хранилище (Context/Redux/Zustand или SecureStore/AsyncStorage) и прокинуть реальный `userId` и `token` в `TripsAPI`.

- **Расширение профиля**
  - Место для получения реального профиля – backend `users` или декодирование JWT.
  - Можно:
    - добавить `/api/users/me` с guard по JWT;
    - на клиенте заменить `MOCK_EMAIL` на данные из этого эндпоинта.

- **Усиление безопасности Trips**
  - Добавить JWT-guard в `TripsController`, брать `userId` из токена вместо тела/параметров.
  - На клиенте – добавлять `Authorization: Bearer <token>` к запросам Trips.

- **Дальнейшее развитие функционала поездок**
  - Детальные параметры поездки: даты, заметки, бюджет, список участников.
  - Сохранение избранных достопримечательностей, рекомендации и т.д.

---

### 6. Краткий конспект для LLM

- **Фронт**: Expo + React Native, expo-router, табы `(tabs)`, стек `(auth)`.
- **Регистрация/логин**: через `AuthAPI` → `AuthController/AuthService` → Prisma `User` + JWT.
- **Профиль**: экран `profile.tsx`, пока с моковым email и простым logout через навигацию.
- **Поездки**:
  - Модель `Trip` в Prisma, модуль `TripsModule`.
  - API `/api/trips` для создания и `/api/trips/user/:userId` для чтения.
  - Главный экран `index.tsx` показывает список поездок пользователя и кнопкой `+` открывает экран создания поездки.
  - Экран `trips.tsx` использует моковые города/аттракции с картинками и `TripsAPI` для создания новой поездки.
  - Привязка к пользователю пока через `MOCK_USER_ID`, без реальной аутентификации на клиенте.

Этот файл можно использовать как основной входной контекст для других LLM, чтобы они понимали архитектуру и текущие ограничения проекта.

