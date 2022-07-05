#include <WiFi.h>
#include <PubSubClient.h>
#include <ModbusMaster.h>
#include "OTA.h"
#include <Wire.h>

#define LED_STATUS  23
#define BTN_SET     35
#define BTN_BOOT    0
#define LED_ON    digitalWrite(LED_STATUS, HIGH)
#define LED_OFF   digitalWrite(LED_STATUS, LOW)

ModbusMaster node;
WiFiClient espClient;
PubSubClient client(espClient);

// Nhập Wifi
const char* mySSID = "Buonmethuat";
const char* myPASSWORD = "12346789";

// Địa chỉ MQTT Server, Port 1883
const char* mqttServer = "116.108.95.238";  

// ClientId (không quan trọng) 
String clientId = "ClientESP32";   

// Topic Publish
const char* m_topic = "GiayXanh/Quantity";       

// Topic Subcribe
const char* sub_topic = "GiayXanh/Control";

// Temp value 
int temp[10] = {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1};

// Address PLC
int address[10] = {100,101,102,103,404,405,406,407,108,109};
char msg[50];

// Biến lưu counter
int16_t counter = -1;
int16_t return_value;

/* Ham call back nhan lai du lieu */
void callback(char* topic, byte* payload, unsigned int length) {

  char read_var;
  String dt_receive ="";
  
  Serial.print("Message read [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    read_var=(char)payload[i];
    dt_receive += read_var;
    Serial.print((char)payload[i]);
  }
  Serial.println();

  xulidulieu(dt_receive);
}

String getValue(String data, char separator, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)==separator || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void xulidulieu(String dataa) {
  
  for (int i = 0; i < 10; i++)
  {
    int value = getValue(dataa,'-',i).toInt();
    if (value != temp[i])
    {
      temp[i] = value;
      if ((i>=4) && (i<8))
      {
        value = value * 10;
      }
      
      Serial.print("Send to PLC: ");
      Serial.println(value);

      node.writeSingleRegister(address[i], value);
    }
  }  
}

void Read_RS485(uint16_t Address_Temp)
{
  uint8_t   result = 0;
  result = node.readHoldingRegisters(Address_Temp, 1);   // dia chi, do dai
  if (result == node.ku8MBSuccess) 
  {
    return_value = node.getResponseBuffer(0);
  }
  else { LED_ON; delay(500); LED_OFF; }
  delay(10);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.publish(m_topic, "Reconnect");               // Gửi dữ liệu
      client.subscribe(sub_topic);                          // Theo dõi dữ liệu
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      // Doi 1s
      delay(1000);
    }
  }
}


void setup() {
  Serial.begin(115200);
  Serial.println("Booting");
  
  // Connect Wifi
  setupOTA("ESP32_OTA", mySSID, myPASSWORD);
  
  // Connect MQTT Broker on Raspberry
  client.setServer(mqttServer, 1883);
  client.setCallback(callback);

  // Connect PLC
  Serial2.begin(19200);  
  node.begin(1, Serial2);   // ID Modbus
  
  pinMode(LED_STATUS, OUTPUT);
  pinMode(BTN_SET,    INPUT_PULLUP);
  pinMode(BTN_BOOT,   INPUT_PULLUP);
}

void loop() {
  // Reconnect MQTT Broker on Raspberry
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  static unsigned long timer;

  if (millis() > timer + 1000) {
    timer = millis();

    // Read value from PLC 
    Read_RS485(410);

    // Send value to MQTT Broker
    if(return_value != counter)
    {
      counter = return_value;
      snprintf (msg, 50, "%d", counter);
      Serial.print("Send value Counter to Broker: ");
      Serial.println(msg);
      client.publish(m_topic, msg);
    }
  }
}
