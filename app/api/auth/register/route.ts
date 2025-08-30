import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Валидация входных данных
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверка валидности email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Неверный формат email адреса' },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = createServiceSupabase();
    } catch (error) {
      console.error('Ошибка инициализации Supabase:', error);
      return NextResponse.json(
        { error: 'Сервер временно недоступен. Попробуйте позже.' },
        { status: 503 }
      );
    }

    // Проверяем, существует ли пользователь с таким email
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хешируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создаем пользователя
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select('id, name, email, created_at')
      .single();

    if (error) {
      console.error('Ошибка создания пользователя:', error);
      return NextResponse.json(
        { error: 'Ошибка при создании аккаунта' },
        { status: 500 }
      );
    }

    // Возвращаем данные пользователя (без пароля)
    return NextResponse.json({
      user: newUser,
      message: 'Аккаунт успешно создан'
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
