#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

/* this can be run with an emulated server on host:
        cd esp8266-core-root-dir
        cd tests/host
        make ../../libraries/ESP8266WebServer/examples/PostServer/PostServer
        bin/PostServer/PostServer
   then put your PC's IP address in SERVER_IP below, port 9080 (instead of default 80):
*/
//#define SERVER_IP "10.0.1.7:9080" // PC address with emulation on host
//#define SERVER_IP "api.cortex.implant.cam"
String SERVER_IP = "lf5.cortex.implant.cam";
#ifndef STASSID
String STASSID = "LF7JCH";
String STAPSK = "LF7CH!!";
#endif

int delayValue = 6000;

void setup() {

  Serial.begin(115200);

  Serial.println();
  Serial.println();
  Serial.println();


  WiFi.begin(STASSID);

  Serial.println(WiFi.macAddress());

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());


//  String serverPath = "http://" + SERVER_IP+"/register";
//  String delayJSON = httpGETRequest(serverPath);
//  JSONVar myObject = JSON.parse(delayJSON);
if ((WiFi.status() == WL_CONNECTED)) {

    WiFiClient client;
    HTTPClient http;

    Serial.print("[HTTP] begin...\n");
    // configure traged server and url
    String waterLevelURL = "https://" +SERVER_IP+ "/register ";
    Serial.println(waterLevelURL);
    http.begin(client, waterLevelURL);  // HTTP
    http.addHeader("Content-Type", "application/json");

    Serial.print("[HTTP] POST...\n");
    // start connection and send HTTP header and body
    String postString = "{\"id\":\""+String(WiFi.macAddress())+"\",\"name\":\"NodeMCU\"}"; 
    Serial.println(postString);
    int httpCode = http.POST(postString);

    // httpCode will be negative on error
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        const String& payload = http.getString();
        Serial.println("received payload:\n<<");
        Serial.println(payload);
        Serial.println(">>");
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

}

void loop() {
  // wait for WiFi connection
  if ((WiFi.status() == WL_CONNECTED)) {

    WiFiClient client;
    HTTPClient http;

    Serial.print("[HTTP] begin...\n");
    // configure traged server and url
    String waterLevelURL = "https://" +SERVER_IP+ "/waterlevel ";
    Serial.println(waterLevelURL);
    http.begin(client, waterLevelURL);  // HTTP
    http.addHeader("Content-Type", "application/json");

    Serial.print("[HTTP] POST...\n");
    // start connection and send HTTP header and body
    String postString = "{\"id\":\""+String(WiFi.macAddress())+"\",\"waterlevel\":"+analogRead(A0)+"}"; 
    Serial.println(postString);
    int httpCode = http.POST(postString);

    // httpCode will be negative on error
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        const String& payload = http.getString();
        Serial.println("received payload:\n<<");
        Serial.println(payload);
        Serial.println(">>");
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

  delay(delayValue);
}
