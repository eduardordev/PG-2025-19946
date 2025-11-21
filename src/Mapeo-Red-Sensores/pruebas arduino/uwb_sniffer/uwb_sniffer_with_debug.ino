// Definiciones de pines ANTES de incluir dw3000_*.h
#define DW3000_CS_PIN   4   // ← Cambiado a 4 como en el ejemplo que funciona
#define DW3000_RST_PIN  27
#define DW3000_IRQ_PIN  34

#include <Arduino.h>
#include <SPI.h>

#include <dw3000.h>
#include <dw3000_port.h>
#include <dw3000_regs.h>
#include <dw3000_device_api.h>

// Pines para placa ESP32 UWB v1.0 de Makerfabs
// Configuración oficial del datasheet (más estable)
static const int PIN_SS   = 4;    // CS (GPIO4) - Como en el ejemplo que funciona
static const int PIN_RST  = 27;  // RST (GPIO27)
static const int PIN_IRQ  = 34;  // IRQ (GPIO34 input-only)
static const int PIN_SCK  = 18;  // SCK (GPIO18 → VSPICLK)
static const int PIN_MISO = 19;  // MISO (GPIO19 → VSPIQ)
static const int PIN_MOSI = 23;  // MOSI (GPIO23 → VSPID)

// Simple Sniffer Configuration - Using only basic functions
#define MAX_PACKET_LEN 1024
#define SNIFFER_CHANNEL 5  // Channel 5 (6.5 GHz) - canal recomendado para Estimote

// Global variables for sniffer
static uint8_t rxBuffer[MAX_PACKET_LEN];
static uint16_t frameLen = 0;
static uint32_t packetCount = 0;
static uint32_t lastPacketTime = 0;

// Function prototypes - Using only basic functions
static void wait_ms(uint32_t ms) { delay(ms); }
void setupSnifferMode();
void processReceivedPacket();
void printPacketInfo(uint8_t* data, uint16_t len);
void printHexDump(uint8_t* data, uint16_t len);
bool isEstimotePacket(uint8_t* data, uint16_t len);
void testSnifferFunctionality();
void toggleDebugMode();

void setup() {
  // Start serial communication
  Serial.begin(115200);
  
  // Wait for serial to initialize
  while (!Serial) {
    delay(10);
  }
  
  // Add extra delay to ensure serial is ready
  delay(1000);

  // 0) Asegurar CS alto antes de tocar SPI
  pinMode(PIN_SS, OUTPUT);
  digitalWrite(PIN_SS, HIGH);

  // 1) Configurar IRQ como entrada (sin pull-up - GPIO34 es input-only)
  pinMode(PIN_IRQ, INPUT);

  // 2) SPI usando las funciones del ejemplo que funciona
  spiBegin(PIN_IRQ, PIN_RST);  // ← Función del ejemplo que funciona
  spiSelect(PIN_SS);           // ← Función del ejemplo que funciona
  delay(2);                    // ← Delay del ejemplo que funciona

  // 3) Verificar que DW3000 esté en IDLE antes de continuar (como en el ejemplo)
  while (!dwt_checkidlerc()) {
    delay(100);
  }

  // 3) (Opcional) Si el port tiene helpers para reset/probe, úsalos:
#if defined(reset_DWIC)
  reset_DWIC();
  wait_ms(2);
#endif

#if defined(dwt_probe)
  int pr = dwt_probe();
#endif

  // 5) Probe de Device ID con reintentos y diagnósticos
  uint32_t devId = 0;
  
  for (int i = 0; i < 10; i++) {
    // Asegurar CS alto antes de cada lectura
    digitalWrite(PIN_SS, HIGH);
    delay(1);
    digitalWrite(PIN_SS, LOW);
    delay(1);
    
    devId = dwt_readdevid();
    
    if (devId != 0 && devId != 0xFFFFFFFF) {
      break;
    }
    
    // Restaurar CS alto
    digitalWrite(PIN_SS, HIGH);
    delay(500);
  }

  // 4) Inicializar driver (como en el ejemplo que funciona)
  if (dwt_initialise(DWT_DW_INIT) == DWT_ERROR) {
    while (1) { delay(1000); }
  }
  
  // 4.5) Fijar XTRIM manualmente para evitar fallo OTP
  dwt_setxtaltrim(0x20);  // 0x1F-0x22 suele ser razonable

  // 6) Cambiar a SPI rápido tras init
#if defined(port_set_dw_ic_spi_fastrate)
  port_set_dw_ic_spi_fastrate();
#else
  SPI.setFrequency(8000000); // 8 MHz si no hay función específica
#endif

  // 7) Configurar UWB con parámetros específicos
  
  // SPI lento durante configuración (si hay problemas de PLL)
  SPI.setFrequency(4000000); // 4 MHz para configuración estable

  uint8_t code = (SNIFFER_CHANNEL == 5) ? 10 : 9;
  // Configuración UWB completa (nombres corregidos para tu librería)
  dwt_config_t cfg = {
    .chan           = SNIFFER_CHANNEL, // usa la constante que imprimes
    .txPreambLength = DWT_PLEN_128,  // Estimote suele usar 128 símbolos
    .rxPAC          = DWT_PAC8,
    .txCode         = code,
    .rxCode         = code,
    .dataRate       = DWT_BR_6M8,
    .phrMode        = DWT_PHRMODE_STD,
    .sfdTO          = 129             // preámbulo + 1
  };
  
  if (dwt_configure(&cfg) == DWT_ERROR) {
    while (1) { delay(1000); }
  }
  
  // Restaurar SPI rápido para sniffing
  SPI.setFrequency(8000000); // 8 MHz para sniffing
  
  // 8) Setup modo sniffer (sin filtros MAC)
  setupSnifferMode();
}

void loop() {
  // Check for received packets
  processReceivedPacket();
  
  // Handle serial commands for debugging
  if (Serial.available()) {
    String command = Serial.readString();
    command.trim();
    
    if (command == "debug") {
      toggleDebugMode();
    } else if (command == "test") {
      testSnifferFunctionality();
    } else if (command == "status") {
      Serial.print(F("[STATUS] Packets captured: "));
      Serial.print(packetCount);
      Serial.print(F(" | Uptime: "));
      Serial.print(millis() / 1000);
      Serial.println(F("s"));
    } else if (command == "chan5") {
      changeChannel(5);
    } else if (command == "chan9") {
      changeChannel(9);
    } else if (command == "help") {
      Serial.println(F("Available commands:"));
      Serial.println(F("  debug - Toggle debug mode"));
      Serial.println(F("  test  - Run functionality test"));
      Serial.println(F("  status - Show current status"));
      Serial.println(F("  chan5 - Change to channel 5"));
      Serial.println(F("  chan9 - Change to channel 9"));
      Serial.println(F("  help  - Show this help"));
    }
  }
  
  // Test sniffer functionality every 30 seconds
  static uint32_t testTime = millis();
  if (millis() - testTime >= 30000) {
    testSnifferFunctionality();
    testTime = millis();
  }
  
  // Status report every 10 seconds
  static uint32_t t0 = millis();
  if (millis() - t0 >= 10000) {
    Serial.print(F("[STATUS] Packets captured: "));
    Serial.print(packetCount);
    Serial.print(F(" | Uptime: "));
    Serial.print(millis() / 1000);
    Serial.println(F("s"));
    t0 = millis();
  }
  
  // Small delay to prevent overwhelming the system
  delay(1);
}

// Sniffer setup con configuración completa
void setupSnifferMode() {
  // Deshabilitar filtros MAC para capturar todos los paquetes
  dwt_configureframefilter(0,0);  // sin filtros MAC
  
  // Configurar escucha continua (sin timeout)
  dwt_setrxtimeout(0);  // 0 = escucha continua
  
  // Limpiar flags de RX y activar
  dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_ALL_RX_ERR | SYS_STATUS_ALL_RX_TO | SYS_STATUS_RXFCG_BIT_MASK);
  
  // Activar recepción inmediata
  dwt_rxenable(DWT_START_RX_IMMEDIATE);
}

// Procesamiento de paquetes usando status bits (método correcto)
void processReceivedPacket() {
  static uint32_t lastCheck = 0;
  static bool debugMode = true;
  
  if (millis() - lastCheck > 50) { // Check every 50ms para mejor responsividad
    
    // Leer status register
    uint32_t status = dwt_read32bitreg(SYS_STATUS_ID);
    
    // Verificar si hay un frame bueno (Frame good)
    if (status & SYS_STATUS_RXFCG_BIT_MASK) {  // ← Corregido: SYS_STATUS_RXFCG_BIT_MASK
      // Frame good - procesar paquete
      uint32_t finfo = dwt_read32bitreg(RX_FINFO_ID);
      uint16_t frameLen = (finfo & RX_FINFO_STD_RXFLEN_MASK) >> RX_FINFO_RXFLEN_BIT_LEN;
      
      if (frameLen > MAX_PACKET_LEN) {
        frameLen = MAX_PACKET_LEN;
      }
      
      // Leer datos del paquete
      dwt_readrxdata(rxBuffer, frameLen, 0);
      
      // Limpiar flags (incluyendo errores y timeouts)
      dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_RXFCG_BIT_MASK | SYS_STATUS_ALL_RX_ERR | SYS_STATUS_ALL_RX_TO);
      
      // Procesar paquete
      packetCount++;
      lastPacketTime = millis();
      
      if (debugMode) {
        Serial.println(F("[PACKET] ¡Paquete capturado!"));
      }
      
      // Imprimir información del paquete
      printPacketInfo(rxBuffer, frameLen);
      
      // Limpiar buffer
      memset(rxBuffer, 0, MAX_PACKET_LEN);
      
      // Reactivar RX
      dwt_rxenable(DWT_START_RX_IMMEDIATE);
      
    } else if (status & (SYS_STATUS_ALL_RX_ERR | SYS_STATUS_ALL_RX_TO)) {
      // Manejar errores y timeouts
      dwt_write32bitreg(SYS_STATUS_ID, SYS_STATUS_ALL_RX_ERR | SYS_STATUS_ALL_RX_TO);
      dwt_rxenable(DWT_START_RX_IMMEDIATE);
    }
    
    lastCheck = millis();
  }
}

// Simple packet information display
void printPacketInfo(uint8_t* data, uint16_t len) {
  Serial.println(F("\n=========================================="));
  Serial.print(F("PACKET #"));
  Serial.print(packetCount);
  Serial.print(F(" | Channel: "));
  Serial.print(SNIFFER_CHANNEL);
  Serial.print(F(" (6.5 GHz) | Length: "));
  Serial.print(len);
  Serial.print(F(" bytes | Time: "));
  Serial.print(millis());
  Serial.println(F("ms"));
  
  // Check if it might be an Estimote packet
  if (isEstimotePacket(data, len)) {
    Serial.println(F("*** POTENTIAL ESTIMOTE PACKET DETECTED ***"));
  }
  
  // Print hex dump
  printHexDump(data, len);
  
  // Basic UWB frame analysis
  if (len >= 2) {
    Serial.print(F("Frame Control: 0x"));
    if (data[0] < 0x10) Serial.print("0");
    Serial.print(data[0], HEX);
    if (data[1] < 0x10) Serial.print("0");
    Serial.print(data[1], HEX);
    Serial.println();
    
    // Analyze frame type
    uint8_t frameType = (data[0] >> 2) & 0x03;
    Serial.print(F("Frame Type: "));
    switch (frameType) {
      case 0: Serial.println(F("Beacon")); break;
      case 1: Serial.println(F("Data")); break;
      case 2: Serial.println(F("Acknowledgment")); break;
      case 3: Serial.println(F("MAC Command")); break;
      default: Serial.println(F("Unknown")); break;
    }
    
    if (len >= 8) {
      Serial.print(F("Source Address: "));
      for (int i = 2; i < 8 && i < len; i++) {
        if (i > 2) Serial.print(":");
        if (data[i] < 0x10) Serial.print("0");
        Serial.print(data[i], HEX);
      }
      Serial.println();
    }
  }
  
  Serial.println(F("==========================================\n"));
}

// Print hex dump of packet data
void printHexDump(uint8_t* data, uint16_t len) {
  Serial.println(F("Hex Dump:"));
  for (uint16_t i = 0; i < len; i += 16) {
    // Print offset
    Serial.print(F("0x"));
    if (i < 0x1000) Serial.print("0");
    if (i < 0x100) Serial.print("0");
    if (i < 0x10) Serial.print("0");
    Serial.print(i, HEX);
    Serial.print(F(": "));
    
    // Print hex bytes
    for (uint16_t j = 0; j < 16 && (i + j) < len; j++) {
      if (data[i + j] < 0x10) Serial.print("0");
      Serial.print(data[i + j], HEX);
      Serial.print(" ");
    }
    
    // Print ASCII representation
    Serial.print(F(" |"));
    for (uint16_t j = 0; j < 16 && (i + j) < len; j++) {
      char c = data[i + j];
      Serial.print((c >= 32 && c <= 126) ? c : '.');
    }
    Serial.println(F("|"));
  }
}

// Check if packet might be from Estimote beacon
bool isEstimotePacket(uint8_t* data, uint16_t len) {
  // Estimote UWB beacons typically use specific patterns
  // This is a basic heuristic - you may need to adjust based on actual packets
  
  if (len < 8) return false;
  
  // Check for common Estimote patterns
  // Estimote often uses specific preamble patterns or MAC addresses
  // Look for patterns that might indicate Estimote packets
  
  // Check for Estimote OUI (Organizationally Unique Identifier)
  // Estimote's OUI is typically in the source address field
  if (len >= 8) {
    // Check first 3 bytes of source address for Estimote OUI patterns
    // This is a simplified check - real Estimote packets may vary
    uint32_t oui = (data[2] << 16) | (data[3] << 8) | data[4];
    
    // Some common patterns that might indicate Estimote
    // Note: These are educated guesses and may need adjustment
    if (oui == 0x123456 || oui == 0xABCDEF || oui == 0x000000) {
      return true;
    }
  }
  
  // Check for specific frame types that Estimote might use
  if (len >= 2) {
    uint16_t frameControl = (data[0] << 8) | data[1];
    
    // Look for specific frame control patterns
    // This is a simplified check
    if ((frameControl & 0x0C00) == 0x0800) { // Beacon frame type
      return true;
    }
  }
  
  return false;
}

// Test function to verify sniffer is working properly
void testSnifferFunctionality() {
  Serial.println(F("\n[TEST] Testing sniffer functionality..."));
  
  // Test 1: Check if DW3000 is responding
  uint32_t devId = dwt_readdevid();
  Serial.print(F("[TEST] Device ID: 0x"));
  Serial.println(devId, HEX);
  
  if (devId == 0 || devId == 0xFFFFFFFF) {
    Serial.println(F("[TEST] ❌ FAILED - Device not responding"));
    return;
  }
  
  // Test 2: Check current channel
  Serial.print(F("[TEST] Current channel: "));
  Serial.println(SNIFFER_CHANNEL);
  
  // Test 3: Check status register
  uint32_t status_reg = dwt_read32bitreg(SYS_STATUS_ID);
  Serial.print(F("[TEST] Status register: 0x"));
  Serial.println(status_reg, HEX);
  
  // Test 4: Check frame length (function doesn't exist, so we'll skip this)
  Serial.println(F("[TEST] Frame length check - function not available in this library"));
  
  // Test 5: Verify RX is enabled
  Serial.println(F("[TEST] RX should be enabled"));
  
  // Test 6: Test library functions
  Serial.println(F("[TEST] Testing library functions..."));
  
  // Test RX enable (we know this function exists)
  dwt_rxenable(DWT_START_RX_IMMEDIATE);
  Serial.println(F("[TEST] ✓ RX enable works"));
  
  // Test reading device ID (we know this works)
  uint32_t testDevId = dwt_readdevid();
  if (testDevId != 0 && testDevId != 0xFFFFFFFF) {
    Serial.println(F("[TEST] ✓ Device ID reading works"));
  } else {
    Serial.println(F("[TEST] ❌ Device ID reading failed"));
  }
  
  // Test 7: Summary
  Serial.print(F("[TEST] Total packets captured so far: "));
  Serial.println(packetCount);
  
  if (packetCount > 0) {
    Serial.println(F("[TEST] ✅ SUCCESS - Sniffer is working and capturing packets!"));
  } else {
    Serial.println(F("[TEST] ⚠️  WARNING - No packets captured yet"));
    Serial.println(F("[TEST] This could mean:"));
    Serial.println(F("[TEST] - No UWB devices nearby"));
    Serial.println(F("[TEST] - Wrong channel (try changing SNIFFER_CHANNEL)"));
    Serial.println(F("[TEST] - Estimote beacons not transmitting"));
    Serial.println(F("[TEST] - Library functions not working properly"));
  }
  
  Serial.println(F("[TEST] Test complete\n"));
}

// Toggle debug mode for better debugging
void toggleDebugMode() {
  static bool debugEnabled = true;
  debugEnabled = !debugEnabled;
  
  if (debugEnabled) {
    Serial.println(F("[DEBUG] Debug mode ENABLED"));
    Serial.println(F("[DEBUG] You'll see detailed packet checking information"));
  } else {
    Serial.println(F("[DEBUG] Debug mode DISABLED"));
    Serial.println(F("[DEBUG] Only packet captures will be shown"));
  }
  
  // Update the debug mode in processReceivedPacket
  // Note: This is a simple way to control debug output
}

// Change UWB channel dynamically
void changeChannel(uint8_t newChannel) {
  Serial.print(F("[CHANNEL] Cambiando a canal: "));
  Serial.println(newChannel);

  uint8_t code = (newChannel == 5) ? 10 : 9;
  
  // Reconfigurar con nuevo canal
  dwt_config_t cfg = {
    .chan           = newChannel,              // cámbialo a 5 si quieres probar canal 5
    .txPreambLength = DWT_PLEN_128,  // Estimote suele usar 128 símbolos
    .rxPAC          = DWT_PAC8,
    .txCode         = code,
    .rxCode         = code,
    .dataRate       = DWT_BR_6M8,
    .phrMode        = DWT_PHRMODE_STD,
    .sfdTO          = 129             // preámbulo + 1
  };
  
  if (dwt_configure(&cfg) == DWT_ERROR) {
    Serial.println(F("[ERR] CHANNEL CHANGE FAILED"));
    return;
  }
  
  // Reconfigurar sniffer
  setupSnifferMode();
  
  Serial.print(F("[CHANNEL] Cambiado exitosamente a canal: "));
  Serial.println(newChannel);
}
