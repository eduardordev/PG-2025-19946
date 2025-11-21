// Script de debug para verificar variables de entorno
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Debug de variables de entorno:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');

if (process.env.DATABASE_URL) {
  console.log('URL completa:', process.env.DATABASE_URL);
  
  // Parsear la URL para verificar componentes
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port);
    console.log('Database:', url.pathname);
    console.log('Username:', url.username);
  } catch (error) {
    console.error('Error al parsear URL:', error);
  }
}
