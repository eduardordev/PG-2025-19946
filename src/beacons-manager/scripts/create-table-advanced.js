// Script mejorado para crear tabla usando la API REST correcta de Xata
const XATA_API_KEY = process.env.XATA_API_KEY || 'xau_ZIm3MWAOxcJlwHFdM1Fp753qRzpGax4g';
const XATA_DATABASE_URL = process.env.XATA_DATABASE_URL || 'https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh';
const XATA_BRANCH = process.env.XATA_BRANCH || 'main';

console.log('🚀 Creando tabla info_beacons usando API REST de Xata...');

async function createTableWithAPI() {
  try {
    console.log('📊 Configuración:');
    console.log(`   - API Key: ${XATA_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - Database URL: ${XATA_DATABASE_URL ? '✅ Configurada' : '❌ No configurada'}`);
    console.log(`   - Branch: ${XATA_BRANCH}`);
    
    // Primero, vamos a verificar si la tabla ya existe
    console.log('\n🔍 Verificando si la tabla ya existe...');
    const checkUrl = `${XATA_DATABASE_URL}/db/beacons-db:${XATA_BRANCH}/tables/info_beacons`;
    
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${XATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (checkResponse.ok) {
      console.log('✅ La tabla info_beacons ya existe!');
      const data = await checkResponse.json();
      console.log('📊 Información de la tabla:', JSON.stringify(data, null, 2));
      return;
    }

    // Si no existe, intentar crearla usando diferentes endpoints
    console.log('\n📋 La tabla no existe, intentando crearla...');
    
    // Método 1: Usar el endpoint de esquema
    const schemaUrl = `${XATA_DATABASE_URL}/db/beacons-db:${XATA_BRANCH}/schema`;
    
    const schemaData = {
      tables: [
        {
          name: 'info_beacons',
          columns: [
            { name: 'numSensor', type: 'string' },
            { name: 'codSensor', type: 'string' },
            { name: 'idenSensor', type: 'string' },
            { name: 'x', type: 'float' },
            { name: 'y', type: 'float' },
            { name: 'z', type: 'float' },
            { name: 'unidades', type: 'string' },
            { name: 'nivel', type: 'int' }
          ]
        }
      ]
    };

    console.log('🔗 Intentando crear tabla con endpoint de esquema...');
    console.log(`URL: ${schemaUrl}`);
    
    const schemaResponse = await fetch(schemaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schemaData)
    });

    if (schemaResponse.ok) {
      console.log('✅ Tabla creada exitosamente usando endpoint de esquema!');
      const result = await schemaResponse.json();
      console.log('📊 Resultado:', JSON.stringify(result, null, 2));
    } else {
      const errorData = await schemaResponse.text();
      console.log(`❌ Error con endpoint de esquema: ${schemaResponse.status} ${schemaResponse.statusText}`);
      console.log(`📋 Detalles: ${errorData}`);
      
      // Método 2: Intentar con endpoint de migración
      console.log('\n🔄 Intentando método alternativo...');
      const migrationUrl = `${XATA_DATABASE_URL}/db/beacons-db:${XATA_BRANCH}/migrations`;
      
      const migrationData = {
        operations: [
          {
            type: 'createTable',
            table: 'info_beacons',
            columns: [
              { name: 'numSensor', type: 'string' },
              { name: 'codSensor', type: 'string' },
              { name: 'idenSensor', type: 'string' },
              { name: 'x', type: 'float' },
              { name: 'y', type: 'float' },
              { name: 'z', type: 'float' },
              { name: 'unidades', type: 'string' },
              { name: 'nivel', type: 'int' }
            ]
          }
        ]
      };

      const migrationResponse = await fetch(migrationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XATA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(migrationData)
      });

      if (migrationResponse.ok) {
        console.log('✅ Tabla creada exitosamente usando migración!');
        const result = await migrationResponse.json();
        console.log('📊 Resultado:', JSON.stringify(result, null, 2));
      } else {
        const errorData = await migrationResponse.text();
        console.log(`❌ Error con migración: ${migrationResponse.status} ${migrationResponse.statusText}`);
        console.log(`📋 Detalles: ${errorData}`);
        
        console.log('\n💡 Solución Manual:');
        console.log('1. Ve al dashboard de Xata:');
        console.log(`   https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh/db/beacons-db:main`);
        console.log('2. Crea manualmente la tabla "info_beacons"');
        console.log('3. Agrega las columnas especificadas');
        console.log('4. Ejecuta: npm run db:check');
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la creación:', error.message);
    console.log('\n💡 Solución Manual:');
    console.log('1. Ve al dashboard de Xata:');
    console.log(`   https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh/db/beacons-db:main`);
    console.log('2. Crea manualmente la tabla "info_beacons"');
    console.log('3. Agrega las columnas especificadas');
    console.log('4. Ejecuta: npm run db:check');
  }
}

createTableWithAPI();
