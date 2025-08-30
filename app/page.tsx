'use client';

import { useState, useCallback } from 'react';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [appType, setAppType] = useState<'mobile' | 'web' | ''>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'pricing' | 'login' | 'register'>('home');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || !appType) return;

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea, appType }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${appType === 'web' ? 'web_app' : 'mobile_app'}_context.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Очищаем форму после успешной генерации
        setIdea('');
        setAppType('');
      } else {
        const errorData = await response.json();
        console.error('Ошибка генерации:', errorData.error);
        alert('Ошибка при генерации файла: ' + (errorData.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка при генерации файла:', error);
      alert('Ошибка соединения с сервером. Попробуйте еще раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegisterSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Пароли не совпадают');
      return;
    }

    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthSuccess('Аккаунт успешно создан! Теперь вы можете войти в систему.');
        setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          setCurrentPage('login');
          setAuthSuccess('');
        }, 2000);
      } else {
        setAuthError(data.error || 'Ошибка при создании аккаунта');
      }
    } catch (error) {
      setAuthError('Ошибка соединения с сервером');
    } finally {
      setAuthLoading(false);
    }
  }, [registerForm]);

  const handleLoginSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthSuccess('Успешный вход в систему!');
        setLoginForm({ email: '', password: '' });
        setTimeout(() => {
          setCurrentPage('home');
          setAuthSuccess('');
        }, 1000);
      } else {
        setAuthError(data.error || 'Ошибка при входе в систему');
      }
    } catch (error) {
      setAuthError('Ошибка соединения с сервером');
    } finally {
      setAuthLoading(false);
    }
  }, [loginForm]);

  const handleRegisterChange = useCallback((field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLoginChange = useCallback((field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  }, []);

  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I2C</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Idea2Context</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button onClick={() => setCurrentPage('home')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Возможности</button>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Поддержка</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Безопасность</a>
                <button onClick={() => setCurrentPage('pricing')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Тарифы</button>
              </nav>
              <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('login')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Войти
                </button>
                <button onClick={() => setCurrentPage('register')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Регистрация
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Создать аккаунт</h2>
              <p className="text-gray-600">Присоединяйтесь к Idea2Context и начните превращать идеи в реальность</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}
            {authSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{authSuccess}</p>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Полное имя
                </label>
                <input
                  type="text"
                  id="name"
                  value={registerForm.name}
                  onChange={(e) => handleRegisterChange('name', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Иван Иванов"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email адрес
                </label>
                <input
                  type="email"
                  id="email"
                  value={registerForm.email}
                  onChange={(e) => handleRegisterChange('email', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ivan@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={registerForm.password}
                  onChange={(e) => handleRegisterChange('password', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  Я согласен с <a href="#" className="text-blue-600 hover:underline">условиями использования</a> и <a href="#" className="text-blue-600 hover:underline">политикой конфиденциальности</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Создание аккаунта...
                  </span>
                ) : 'Создать аккаунт'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Уже есть аккаунт? <button onClick={() => setCurrentPage('login')} className="text-blue-600 hover:underline font-medium">Войти</button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I2C</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Idea2Context</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button onClick={() => setCurrentPage('home')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Возможности</button>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Поддержка</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Безопасность</a>
                <button onClick={() => setCurrentPage('pricing')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Тарифы</button>
              </nav>
              <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Войти
                </button>
                <button onClick={() => setCurrentPage('register')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Регистрация
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Вход в аккаунт</h2>
              <p className="text-gray-600">Добро пожаловать обратно в Idea2Context</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}
            {authSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{authSuccess}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email адрес
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  value={loginForm.email}
                  onChange={(e) => handleLoginChange('email', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ivan@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  value={loginForm.password}
                  onChange={(e) => handleLoginChange('password', e.target.value)}
                  className="form-input w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Запомнить меня
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Забыли пароль?
                </a>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Вход...
                  </span>
                ) : 'Войти'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Нет аккаунта? <button onClick={() => setCurrentPage('register')} className="text-blue-600 hover:underline font-medium">Зарегистрироваться</button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (currentPage === 'pricing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I2C</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Idea2Context</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <button onClick={() => setCurrentPage('home')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Возможности</button>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Поддержка</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Безопасность</a>
                <button onClick={() => setCurrentPage('pricing')} className="text-blue-600 font-semibold transition-colors">Тарифы</button>
              </nav>
              <div className="flex items-center space-x-3">
                <button onClick={() => setCurrentPage('login')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Войти
                </button>
                <button onClick={() => setCurrentPage('register')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Регистрация
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Выберите подходящий тариф</h1>
            <p className="text-xl text-gray-600">Превращайте идеи в структурированные контексты с Idea2Context</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Бесплатный</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">₽0<span className="text-lg font-normal text-gray-600">/месяц</span></div>
                <p className="text-gray-600">Для знакомства с сервисом</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>5 генераций в месяц</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Базовые шаблоны</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Экспорт в Markdown</li>
                <li className="flex items-center"><span className="text-gray-400 mr-3">✗</span>Приоритетная поддержка</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
                Начать бесплатно
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Популярный</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Профессиональный</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">₽990<span className="text-lg font-normal text-gray-600">/месяц</span></div>
                <p className="text-gray-600">Для активных пользователей</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Безлимитные генерации</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Все шаблоны</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Экспорт в Markdown</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Приоритетная поддержка</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>API доступ</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Выбрать план
              </button>
            </div>

            {/* Corporate Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Корпоративный</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">₽2990<span className="text-lg font-normal text-gray-600">/месяц</span></div>
                <p className="text-gray-600">Для команд и компаний</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Все из Профессионального</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Командная работа</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Персональный менеджер</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Кастомные интеграции</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>SLA 99.9%</li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Связаться с нами
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Часто задаваемые вопросы</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Что такое генерация контекста?</h3>
                <p className="text-gray-600">Это процесс создания структурированного технического задания на основе вашей идеи приложения. Мы анализируем описание и создаем детальный контекст для разработчиков.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Можно ли изменить тариф?</h3>
                <p className="text-gray-600">Да, вы можете изменить тариф в любое время. При переходе на более высокий тариф доплата рассчитывается пропорционально.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Есть ли API для интеграции?</h3>
                <p className="text-gray-600">API позволяет интегрировать Idea2Context в ваши системы и автоматизировать процесс генерации контекстов.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Безопасны ли мои данные?</h3>
                <p className="text-gray-600">Мы используем шифрование данных и не сохраняем ваши идеи после генерации контекста. Полная конфиденциальность гарантирована.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Главная страница
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I2C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Idea2Context</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => setCurrentPage('home')} className="text-blue-600 font-semibold transition-colors">Возможности</button>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Поддержка</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Безопасность</a>
              <button onClick={() => setCurrentPage('pricing')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Тарифы</button>
            </nav>
            <div className="flex items-center space-x-3">
              <button onClick={() => setCurrentPage('login')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Войти
              </button>
              <button onClick={() => setCurrentPage('register')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-gray-600 mb-4">Один инструмент</p>
          <p className="text-gray-600 mb-8">для всех ваших идей</p>
          
          <h1 className="text-6xl md:text-7xl font-bold text-black mb-8">
            Take <span className="inline-flex items-center">
              <span className="bg-black text-white px-2 py-1 rounded-md mr-2">✓</span>
              Ctrl.
            </span>
          </h1>
          
          <button className="bg-green-500 text-white px-8 py-3 rounded-full font-medium hover:bg-green-600 transition-colors mb-16">
            ⬇ Скачать для Chrome
          </button>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Превратите идею в контекст</h2>
          <p className="text-gray-600 text-center mb-4">
            Опишите вашу идею приложения, и мы создадим структурированный файл для разработчиков
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Powered by OpenAI GPT-4</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Для работы с ИИ добавьте <code className="bg-blue-100 px-1 rounded">OPENAI_API_KEY</code> в файл <code className="bg-blue-100 px-1 rounded">.env.local</code>
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* App Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAppType('mobile')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  appType === 'mobile'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">📱</div>
                <div className="font-semibold">Мобильное приложение</div>
                <div className="text-sm text-gray-600">iOS, Android</div>
              </button>
              
              <button
                type="button"
                onClick={() => setAppType('web')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  appType === 'web'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">💻</div>
                <div className="font-semibold">Веб-приложение</div>
                <div className="text-sm text-gray-600">React, Vue, Angular</div>
              </button>
            </div>

            {/* Idea Input */}
            <div>
              <label htmlFor="idea" className="block text-sm font-semibold text-gray-700 mb-2">
                Опишите вашу идею
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Например: Приложение для заказа еды с возможностью отслеживания доставки в реальном времени..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              disabled={!idea.trim() || !appType || isGenerating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Генерируем контекст...
                </span>
              ) : 'Создать контекст'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
