# Lumiere API

Lumiere is a platform for community-controlled holiday lighting.

The API is the central source of what the lights should be, and includes a number of ways to change the lights:

- REST API
  - JSON endpoint
  - Twilio endpoint for texting colors as well as images to (includes image support)
- Websocket support (via socket.io)

## Usage

REST API

- `/lights`: Current stack of lights that have been provided.
- `/lights` (POST): Update lights.
- `/lights/current`: Get the currently set lights.
- `/lights/twilio` (POST): Twilio test or image payload.
- `/colors`: Get current list of all colors (note that this will be large)

Websocket

- Utilizes socket.io.
- Event `lights:get`: Sends back current lights.

## Installation

### Configuration

Configuration is managed in environment variables. These can managed in a `.env` file.

- `NODE_ENV`: Standard environment variable, `development` or `production`
- `PORT`: Port to run the application on. Defaults to `3333`.
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `MAX_LIGHTS_STORE`: The maximum number of lights to keep (in memory); defaults to `100`.

## Development

### Twilio

For local testing:

- `npm install twilio-cli -g`
- `twilio login`
- `twilio phone-numbers:update "PHONE_NUMBER" --sms-url="http://localhost:PORT/lights/twilio"`
- Send message to phone number.

Or you can manually hit the endpoint with something like:

- `curl --data "Body=blue" -X POST http://localhost:PORT/lights/twilio`

## Colors

See `lib/colors/index.js` for color sources.

### Collecting / scraping

Some scraping has been done with some real-quick jQuery, in-browser scraping, others require a bit more:

- Pokemon palettes: Run `node lib/colors/collect/pokemon.js`. Note that it will store files in `.cache/`.

## Deployment

Deployed wherever a NodeJS app can be deployed with websocket support.

### Heroku

- Create new project in Heroku.
- Setup [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and `heroku login`.
- Add Heroku remote: `heroku git:remote -a HEROKU_APP_NAME`
- Deploy changes: `git push heroku main`
- Enable/scale with something like: `heroku ps:scale web=1`
