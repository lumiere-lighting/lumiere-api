## Twilio

### Local testing

- `npm install twilio-cli -g`
- `twilio login`
- `twilio phone-numbers:update "PHONE_NUMBER" --sms-url="http://localhost:PORT/lights/twilio"`
- Send message to phone number.

Or you can manually hit the endpoint with something like:

- `curl --data "Body=blue" -X POST http://localhost:PORT/lights/twilio`
