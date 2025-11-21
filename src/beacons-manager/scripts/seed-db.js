import { initializeDatabase } from './src/lib/schema';
import db from './src/lib/database';

initializeDatabase();

const sampleData = [
  { numSensor: null, codSensor: null, idenSensor: null, x: -0.9, y: 2.5, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 5.5, y: 4.75, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 17, y: -2.9, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 19.26, y: 5, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 13.03, y: 12.2, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 14.58, y: 23, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 17, y: 29.6, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 24, y: 22.4, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 37, y: 25.41, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 46, y: 22.4, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 58.5, y: 25.4, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 63.15, y: 23.5, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 53.41, y: 19.5, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 69.5, y: 18.1, z: 2.1, unidades: null, nivel: 6 },
  { numSensor: null, codSensor: null, idenSensor: null, x: 81.6, y: 19.5, z: 2.1, unidades: null, nivel: 6 },
];

const insertStmt = db.prepare(`
  INSERT INTO info_beacons (numSensor, codSensor, idenSensor, x, y, z, unidades, nivel)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Inserting sample data...');
for (const data of sampleData) {
  insertStmt.run(
    data.numSensor,
    data.codSensor,
    data.idenSensor,
    data.x,
    data.y,
    data.z,
    data.unidades,
    data.nivel
  );
}

console.log(`Inserted ${sampleData.length} sample records`);

const additionalData = [
  { numSensor: 'S001', codSensor: 'C001', idenSensor: 'I001', x: 10, y: 10, z: 2.5, unidades: 'm', nivel: 5 },
  { numSensor: 'S002', codSensor: 'C002', idenSensor: 'I002', x: 20, y: 20, z: 2.5, unidades: 'm', nivel: 5 },
  { numSensor: 'S003', codSensor: 'C001', idenSensor: 'I003', x: 30, y: 30, z: 2.5, unidades: 'm', nivel: 7 },
  { numSensor: 'S004', codSensor: 'C003', idenSensor: 'I004', x: 40, y: 40, z: 2.5, unidades: 'm', nivel: 7 },
];

console.log('Inserting additional sample data for filtering...');
for (const data of additionalData) {
  insertStmt.run(
    data.numSensor,
    data.codSensor,
    data.idenSensor,
    data.x,
    data.y,
    data.z,
    data.unidades,
    data.nivel
  );
}

console.log(`Inserted ${additionalData.length} additional sample records`);
console.log('Database seeded successfully!');
