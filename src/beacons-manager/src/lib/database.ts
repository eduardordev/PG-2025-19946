import { Pool } from 'pg';

// Configuración de PostgreSQL (configuración original que funcionaba)
const pool = new Pool({
  host: 'us-east-1.sql.xata.sh',
  port: 5432,
  database: 'beacons-db',
  user: 'dbu6or',
  password: 'xau_ZIm3MWAOxcJlwHFdM1Fp753qRzpGax4g',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentado a 10 segundos
});

// Función para obtener conexión
export async function getConnection() {
  return await pool.connect();
}

// Función para obtener el cliente Xata (simulado para compatibilidad)
export function getXataClient() {
  return {
    db: {
      areas_beacons: {
        getAll: async () => {
          const client = await getConnection();
          try {
            const result = await client.query('SELECT * FROM areas_beacons ORDER BY numero');
            return result.rows;
          } finally {
            client.release();
          }
        },
        
        create: async (data: any) => {
          const client = await getConnection();
          try {
            const result = await client.query(
              'INSERT INTO areas_beacons (numero, nombre, codigo, descripcion, ubicacion, color, activo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
              [data.numero, data.nombre, data.codigo, data.descripcion, data.ubicacion, data.color, data.activo]
            );
            return result.rows[0];
          } finally {
            client.release();
          }
        },
        
        read: async (id: string) => {
          const client = await getConnection();
          try {
            const result = await client.query('SELECT * FROM areas_beacons WHERE xata_id = $1', [id]);
            return result.rows[0];
          } finally {
            client.release();
          }
        },
        
        update: async (id: string, data: any) => {
          const client = await getConnection();
          try {
            const result = await client.query(
              'UPDATE areas_beacons SET numero = $1, nombre = $2, codigo = $3, descripcion = $4, ubicacion = $5, color = $6, activo = $7 WHERE xata_id = $8 RETURNING *',
              [data.numero, data.nombre, data.codigo, data.descripcion, data.ubicacion, data.color, data.activo, id]
            );
            return result.rows[0];
          } finally {
            client.release();
          }
        },
        
        delete: async (id: string) => {
          const client = await getConnection();
          try {
            const result = await client.query('DELETE FROM areas_beacons WHERE xata_id = $1 RETURNING *', [id]);
            return result.rows[0];
          } finally {
            client.release();
          }
        },
        
        filter: (conditions: any) => ({
          getFirst: async () => {
            const client = await getConnection();
            try {
              const result = await client.query('SELECT * FROM areas_beacons WHERE numero = $1', [conditions.numero]);
              return result.rows[0] || null;
            } finally {
              client.release();
            }
          }
        })
      },
      
      info_beacons: {
        getAll: async () => {
          const client = await getConnection();
          try {
            const result = await client.query('SELECT * FROM info_beacons ORDER BY id');
            return result.rows;
          } finally {
            client.release();
          }
        },
        
        create: async (data: any) => {
          const client = await getConnection();
          try {
            const result = await client.query(
              'INSERT INTO info_beacons (numsensor, codsensor, idensensor, x, y, z, unidades, nivel) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
              [data.numsensor, data.codsensor, data.idensensor, data.x, data.y, data.z, data.unidades, data.nivel]
            );
            return result.rows[0];
          } finally {
            client.release();
          }
        },
        
        filter: (conditions: any) => ({
          getAll: async () => {
            const client = await getConnection();
            try {
              const result = await client.query('SELECT * FROM info_beacons WHERE nivel = $1', [conditions.nivel]);
              return result.rows;
            } finally {
              client.release();
            }
          }
        })
      }
    }
  };
}

// Función para verificar la conexión
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await getConnection();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
}