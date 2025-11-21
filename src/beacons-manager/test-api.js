// Usar fetch nativo de Node.js 18+

async function testApi() {
  try {
    console.log('🔍 Probando API /api/beacons...');
    
    const response = await fetch('http://localhost:3000/api/beacons');
    const data = await response.json();
    
    console.log('\n📊 Respuesta de la API:');
    console.log('Success:', data.success);
    console.log('Count:', data.count);
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔍 Primer sensor de la respuesta:');
      const firstBeacon = data.data[0];
      console.log({
        id: firstBeacon.id,
        numSensor: firstBeacon.numsensor,
        codSensor: firstBeacon.codsensor,
        status: firstBeacon.status,
        hasStatus: 'status' in firstBeacon
      });
      
      // Verificar si todos los sensores tienen status
      const withStatus = data.data.filter(b => b.status).length;
      const withoutStatus = data.data.length - withStatus;
      
      console.log(`\n📈 Estadísticas de status:`);
      console.log(`- Con status: ${withStatus}`);
      console.log(`- Sin status: ${withoutStatus}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testApi();
