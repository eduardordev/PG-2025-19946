import fs from 'fs';
import path from 'path';
import { getDatabase } from './src/lib/database';

const backupDir = path.join(process.cwd(), 'backups');

// Crear directorio de backups si no existe
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `database-backup-${timestamp}.sqlite`);

try {
  console.log('🔄 Creating database backup...');
  
  // Obtener la base de datos
  const db = getDatabase();
  
  // Crear backup usando VACUUM INTO
  db.exec(`VACUUM INTO '${backupPath}'`);
  
  console.log(`✅ Backup created successfully: ${backupPath}`);
  
  // Mostrar información del backup
  const stats = fs.statSync(backupPath);
  console.log(`📊 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // Contar registros en el backup
  const backupDb = require('better-sqlite3')(backupPath);
  const count = backupDb.prepare('SELECT COUNT(*) as count FROM info_beacons').get();
  console.log(`📈 Records backed up: ${count.count}`);
  
  backupDb.close();
  
} catch (error) {
  console.error('❌ Backup failed:', error);
  process.exit(1);
}
