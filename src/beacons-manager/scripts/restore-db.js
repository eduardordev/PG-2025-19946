import fs from 'fs';
import path from 'path';
import { getDatabase } from './src/lib/database';

const backupDir = path.join(process.cwd(), 'backups');

// Listar backups disponibles
const listBackups = () => {
  if (!fs.existsSync(backupDir)) {
    console.log('❌ No backups directory found');
    return [];
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.sqlite'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => b.created.getTime() - a.created.getTime());
  
  return files;
};

// Restaurar desde backup
const restoreFromBackup = (backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Backup file not found:', backupPath);
      return false;
    }
    
    console.log('🔄 Restoring database from backup...');
    
    // Obtener la base de datos actual
    const db = getDatabase();
    
    // Cerrar la conexión actual
    db.close();
    
    // Obtener la ruta de la base de datos actual
    const currentDbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/database.sqlite'
      : path.join(process.cwd(), 'data', 'database.sqlite');
    
    // Crear backup de la base de datos actual
    const currentBackup = `${currentDbPath}.backup.${Date.now()}`;
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, currentBackup);
      console.log(`📋 Current database backed up to: ${currentBackup}`);
    }
    
    // Restaurar desde el backup
    fs.copyFileSync(backupPath, currentDbPath);
    
    console.log('✅ Database restored successfully');
    
    // Verificar el restore
    const restoredDb = require('better-sqlite3')(currentDbPath);
    const count = restoredDb.prepare('SELECT COUNT(*) as count FROM info_beacons').get();
    console.log(`📈 Records restored: ${count.count}`);
    
    restoredDb.close();
    
    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    return false;
  }
};

// Función principal
const main = () => {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Listar backups disponibles
    const backups = listBackups();
    
    if (backups.length === 0) {
      console.log('📭 No backups found');
      return;
    }
    
    console.log('📋 Available backups:');
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.name}`);
      console.log(`   Size: ${(backup.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${backup.created.toLocaleString()}`);
      console.log('');
    });
    
    console.log('💡 Usage: npm run db:restore <backup-name>');
    console.log('💡 Example: npm run db:restore database-backup-2024-01-15T10-30-00-000Z.sqlite');
    
  } else {
    // Restaurar backup específico
    const backupName = args[0];
    const backupPath = path.join(backupDir, backupName);
    
    if (restoreFromBackup(backupPath)) {
      console.log('🎉 Restore completed successfully');
    } else {
      console.log('💥 Restore failed');
      process.exit(1);
    }
  }
};

main();
