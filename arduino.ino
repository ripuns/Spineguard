#include <Wire.h>// importing library for I2C Communication
#include <MPU6050.h>
MPU6050 mpu; //create an object for MPU6050
unsigned long t0 //use unsigned to not get negative values
unsigned long lastBuzzTime = 0; //last buzz time for bad posture
const unsigned long buzzCooldown = 5000; //cooldown time

 void setup(){
  Wire.begin(); //I2C Communication begins
  mpu=initalize(); //initialising the mpu object
  t0=millis() //assign time to milliseconds
  Serial.println("ts,ax,ay,az,gx,gy,gz")//giving csv headers
  Serial.begin(115200)//connecting laptop to arduinho
   pinMode(BUZZ_PIN, OUTPUT);    
  
 }
 void loop() {
  // we are reading sensor data from mpu6050here
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  float fax = ax / 16384.0;
  float fay = ay / 16384.0;
  float faz = az / 16384.0;
  float fgx = gx / 131.0;
  float fgy = gy / 131.0;
  float fgz = gz / 131.0;

  unsigned long ts = millis() - t0;

  // this is the csv data getting printed
  Serial.print(ts); Serial.print(",");
  Serial.print(fax, 6); Serial.print(",");
  Serial.print(fay, 6); Serial.print(",");
  Serial.print(faz, 6); Serial.print(",");
  Serial.print(fgx, 6); Serial.print(",");
  Serial.print(fgy, 6); Serial.print(",");
  Serial.println(fgz, 6);

  // sPECIFYING POSTURE RULES
  unsigned long now = millis();
  if (now - lastBuzzTime >= buzzCooldown) {
    if (fax < -0.3) {
      buzzSlouch();         // forward slouch
      lastBuzzTime = now;
    } else if (fax > 0.3) {
      buzzLeanBack();       // leaning backward
      lastBuzzTime = now;
    } else if (fay < -0.3) {
      buzzLeanLeft();       // leaning left
      lastBuzzTime = now;
    } else if (fay > 0.3) {
      buzzLeanRight();      // leaning right
      lastBuzzTime = now;
    }
  }

  delay(10); // 100 Hz
}

// Buzz Patterns
void buzzSlouch() {
  digitalWrite(BUZZ_PIN, HIGH);
  delay(150);
  digitalWrite(BUZZ_PIN, LOW);
}

void buzzLeanLeft() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZ_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZ_PIN, LOW);
    delay(100);
  }
}

void buzzLeanRight() {
  digitalWrite(BUZZ_PIN, HIGH);
  delay(400);  // long buzz
  digitalWrite(BUZZ_PIN, LOW);
}

void buzzLeanBack() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZ_PIN, HIGH);
    delay(80);
    digitalWrite(BUZZ_PIN, LOW);
    delay(80);
  }
}
