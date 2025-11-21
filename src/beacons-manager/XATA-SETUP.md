# 🚀 Configuración de Xata - Beacons Manager

## ✅ Tu Base de Datos Xata está Lista

### **📊 Información de tu Base de Datos:**
- **URL**: `https://Eduardo-Ram-rez-s-workspace-dbu6or.us-east-1.xata.sh/db/beacons-db:main`
- **API Key**: `xau_ZIm3MWAOxcJlwHFdM1Fp753qRzpGax4g`
- **Branch**: `main`

## 🔧 Pasos para Configurar

### **1. Instalar Dependencias**
```bash
npm install
```

### **2. Configurar Variables de Entorno**
```bash
# Copiar archivo de configuración
cp env.local .env.local
```

### **3. Verificar Conexión**
```bash
npm run db:check
```

### **4. Ejecutar la Aplicación**
```bash
npm run dev
```

## 📋 Configuración de Tablas en Xata

### **Tabla: info_beacons**
Necesitas crear esta tabla en tu dashboard de Xata con las siguientes columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `numSensor` | String | Número del sensor |
| `codSensor` | String | Código del sensor |
| `idenSensor` | String | Identificación del sensor |
| `x` | Float | Coordenada X |
| `y` | Float | Coordenada Y |
| `z` | Float | Coordenada Z |
| `unidades` | String | Unidades de medida |
| `nivel` | Int | Nivel |

### **Tabla: users**
Para autenticación:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `email` | String | Email del usuario |
| `name` | String | Nombre del usuario |
| `passwordHash` | String | Hash de la contraseña |

## 🎯 Ventajas de Xata

### **✅ Persistencia Garantizada**
- Los datos **NUNCA se pierden**
- Acceso desde cualquier lugar
- Backup automático

### **✅ Acceso Múltiple**
- Varios usuarios pueden acceder simultáneamente
- API REST automática
- Dashboard web para administración

### **✅ Escalabilidad**
- Crece con tu aplicación
- Sin límites de conexiones
- Rendimiento optimizado

### **✅ Gratuito**
- Plan gratuito generoso
- Sin costos ocultos
- Ideal para proyectos académicos

## 🔍 Verificación de Configuración

### **Comando de Verificación:**
```bash
npm run db:check
```

### **Respuesta Esperada:**
```
🔍 Verificando conexión a Xata...
📊 Configuración de Xata:
   - API Key: ✅ Configurada
   - Database URL: ✅ Configurada
   - Branch: main
✅ Conexión a Xata exitosa
📈 Registros encontrados: 0
📭 No hay registros aún - ¡Perfecto para empezar!
```

## 🚀 Próximos Pasos

1. **Ejecutar**: `npm run dev`
2. **Abrir**: `http://localhost:3000`
3. **Registrar**: Crear tu primer usuario
4. **Agregar**: Tus primeros beacons
5. **Compartir**: La URL con otros usuarios

## 💡 Consejos

- **Dashboard Xata**: Visita tu dashboard para ver los datos en tiempo real
- **API Directa**: Puedes usar la API de Xata directamente si necesitas
- **Escalabilidad**: Cuando crezca, puedes actualizar el plan fácilmente

¡Tu aplicación está lista para usar con persistencia completa y acceso múltiple!
