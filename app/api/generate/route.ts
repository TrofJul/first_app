import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface GenerateRequest {
  idea: string;
  appType: 'mobile' | 'web';
}

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

async function generateAIContent(idea: string, appType: 'mobile' | 'web'): Promise<string> {
  const appTypeRu = appType === 'web' ? 'веб-приложения' : 'мобильного приложения';
  
  const prompt = `Создай детальное техническое задание для разработки ${appTypeRu} на основе следующей идеи: "${idea}"

Структура документа должна включать:
1. Обзор проекта с описанием идеи
2. Основные функции и возможности
3. Технологический стек (подходящий для ${appType === 'web' ? 'веб-разработки' : 'мобильной разработки'})
4. Целевая аудитория
5. План разработки по этапам
6. Требования к безопасности
7. Метрики успеха

Ответ должен быть на русском языке в формате Markdown. Будь конкретным и практичным в рекомендациях.`;

  try {
    if (!openai) {
      throw new Error('OpenAI не инициализирован');
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты опытный технический архитектор и product manager. Создаваешь детальные технические задания для разработки приложений на русском языке."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || generateFallbackContent(idea, appType);
  } catch (error) {
    console.error('Ошибка OpenAI API:', error);
    return generateFallbackContent(idea, appType);
  }
}

function generateFallbackContent(idea: string, appType: 'mobile' | 'web'): string {
  const isWeb = appType === 'web';
  const appTypeRu = isWeb ? 'Веб-приложение' : 'Мобильное приложение';
  const platforms = isWeb ? 'Веб-браузеры (Chrome, Firefox, Safari, Edge)' : 'iOS и Android';
  
  // Базовый технологический стек в зависимости от типа приложения
  const techStack = isWeb 
    ? `### Frontend
- **React** - основная библиотека для создания пользовательского интерфейса
- **Next.js** - фреймворк для серверного рендеринга и SEO оптимизации
- **TypeScript** - типизированный JavaScript для лучшей разработки
- **Tailwind CSS** - утилитарный CSS фреймворк для быстрой стилизации

### Backend
- **Node.js** - серверная среда выполнения JavaScript
- **Express.js** или **Next.js API Routes** - для создания RESTful API
- **PostgreSQL** или **MongoDB** - база данных для хранения информации

### Дополнительные инструменты
- **Vercel** или **Netlify** - для деплоя и хостинга
- **Prisma** или **Mongoose** - ORM для работы с базой данных`
    : `### Mobile Development
- **React Native** - кроссплатформенная разработка для iOS и Android
- **TypeScript** - типизированный JavaScript
- **Expo** - платформа для быстрой разработки и деплоя

### Backend
- **Node.js** - серверная среда выполнения
- **Express.js** - веб-фреймворк для API
- **PostgreSQL** или **MongoDB** - база данных

### Дополнительные инструменты
- **Firebase** - для аутентификации и push-уведомлений
- **App Store Connect** и **Google Play Console** - для публикации приложений`;

  return `# ${appTypeRu}: Техническое задание

## Обзор проекта

**Описание идеи:** ${idea}

**Тип приложения:** ${appTypeRu}
**Целевые платформы:** ${platforms}

## Основные функции и возможности

### Ключевые функции
- Основная функциональность приложения согласно описанной идее
- Пользовательская регистрация и аутентификация
- Интуитивно понятный пользовательский интерфейс
- Адаптивный дизайн для различных размеров экранов

### Дополнительные возможности
- Система уведомлений
- Поиск и фильтрация контента
- Профиль пользователя с настройками
- Система обратной связи и поддержки

## Технологический стек

${techStack}

## Целевая аудитория

### Основные пользователи
- Возраст: 18-45 лет
- Технологическая грамотность: средняя и выше
- Устройства: современные смартфоны и компьютеры

### Потребности пользователей
- Простота использования
- Быстрая загрузка и отзывчивость
- Безопасность личных данных
- Стабильная работа приложения

## План разработки

### Этап 1: Планирование и дизайн (2-3 недели)
- Детальный анализ требований
- Создание wireframes и mockups
- UX/UI дизайн интерфейса
- Техническая архитектура

### Этап 2: MVP разработка (4-6 недель)
- Настройка проекта и среды разработки
- Реализация основных функций
- Базовый пользовательский интерфейс
- Интеграция с backend API

### Этап 3: Тестирование и запуск (2-3 недели)
- Функциональное тестирование
- Тестирование производительности
- Исправление багов
- Подготовка к релизу

### Этап 4: Развитие и масштабирование
- Сбор обратной связи от пользователей
- Добавление новых функций
- Оптимизация производительности
- Расширение пользовательской базы

## Требования к безопасности

- Шифрование пользовательских данных
- Безопасная аутентификация (JWT токены)
- Защита от основных веб-уязвимостей
- Регулярные обновления зависимостей

## Метрики успеха

- Количество активных пользователей
- Время удержания пользователей
- Скорость загрузки приложения
- Оценки в магазинах приложений (для мобильных)
- Конверсия целевых действий

---

*Этот документ создан автоматически с помощью Idea2Context*
*Дата создания: ${new Date().toLocaleDateString('ru-RU')}*`;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    if (!body.idea || !body.appType) {
      return NextResponse.json(
        { error: 'Необходимо указать идею и тип приложения' },
        { status: 400 }
      );
    }

    // Проверяем наличие OpenAI API ключа
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API ключ не найден, используется fallback генерация');
      const markdownContent = generateFallbackContent(body.idea, body.appType);
      return new NextResponse(markdownContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': 'attachment; filename="first_app.md"',
        },
      });
    }

    const markdownContent = await generateAIContent(body.idea, body.appType);
    
    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="first_app.md"',
      },
    });
  } catch (error) {
    console.error('Ошибка при генерации файла:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
