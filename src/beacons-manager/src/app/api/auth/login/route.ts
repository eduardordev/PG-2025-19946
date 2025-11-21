import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// POST /api/auth/login - Login de usuario
export async function POST(request: NextRequest) {
  try {
    
    const { email, password } = await request.json() as { email: string; password: string };
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    const client = await getConnection();
    
    // Buscar usuario por email
    const result = await client.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
    
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}