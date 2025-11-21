#include <SPI.h>
#include <DW1000.h>

// Pines DW1000
#define PIN_RST 27
#define PIN_IRQ 34
#define PIN_SS  21
#define PIN_SCK 18
#define PIN_MISO 19
#define PIN_MOSI 23

#define MAX_DATA_SIZE 1024
byte data[MAX_DATA_SIZE];

const int channels[] = {1, 2, 3, 4, 5, 7};
int currentChannel = 0;
unsigned long lastChannelSwitch = 0;
const unsigned long dwellTime = 5000; // Tiempo en ms por canal (5s)

void handleReceived() {
  Serial.print("📡 Paquete detectado en canal ");
  Serial.println(channels[currentChannel]);

  uint16_t length = DW1000.getDataLength();
  if (length > MAX_DATA_SIZE) length = MAX_DATA_SIZE;
  DW1000.getData(data, length);

  Serial.print("→ Tamaño: ");
  Serial.print(length);
  Serial.println(" bytes");

  Serial.print("→ Datos: ");
  for (int i = 0; i < length; i++) {
    if (data[i] < 0x10) Serial.print("0");
    Serial.print(data[i], HEX);
    Serial.print(" ");
  }
  Serial.println();

  float rxPower = DW1000.getReceivePower();
  Serial.print("→ RX Power: ");
  Serial.print(rxPower);
  Serial.println(" dBm");
  Serial.println("--------------------------------------------------");

  DW1000.startReceive(); // Escucha siguiente
}

void configureDW1000(int channel) {
  DW1000.newConfiguration();
  DW1000.setDefaults();
  // DW1000.setReceiveFrameWaitTimeout(0); // Eliminado porque no existe
  DW1000.useExtendedFrameLength(true);
  DW1000.useSmartPower(true); // <- corregido
  DW1000.setChannel(channel);
  DW1000.setAntennaDelay(16384);

  // Si tu librería no tiene setDataRate, comenta esta línea
  // DW1000.setDataRate(6800);

  DW1000.setPromiscuousMode(true); // ya implementaste esta

  DW1000.commitConfiguration();
  DW1000.startReceive();
  Serial.print("🔄 Escuchando en canal ");
  Serial.println(channel);
}


void setup() {
  Serial.begin(115200);
  delay(1000);

  SPI.begin(PIN_SCK, PIN_MISO, PIN_MOSI);
  DW1000.begin(PIN_IRQ, PIN_RST);
  DW1000.select(PIN_SS);

  DW1000.attachReceivedHandler(handleReceived);

  configureDW1000(channels[currentChannel]);
  lastChannelSwitch = millis();
}

void loop() {
  if (millis() - lastChannelSwitch > dwellTime) {
    currentChannel = (currentChannel + 1) % (sizeof(channels) / sizeof(channels[0]));
    configureDW1000(channels[currentChannel]);
    lastChannelSwitch = millis();
  }
}
