import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// POST /api/auth/register - Registro de usuario
export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json() as { name: string; email: string; password: string };
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }
    
    const client = await getConnection();
    
    // Verificar si el usuario ya existe
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, name]
    );
    
    if (existingUser.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { success: false, error: 'El usuario ya existe' },
        { status: 409 }
      );
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const result = await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [name, email, hashedPassword]
    );
    
    client.release();
    
    const user = result.rows[0];
    
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
      message: 'Usuario creado exitosamente',
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
    console.error('Error en registro:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}