// Dependencies
import dotenv from 'dotenv';

// Environment configuration
dotenv.config();

export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || '3000';
export const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
export const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
export const maxLightsStore = parseInt(
  process.env.MAX_LIGHTS_STORE || '100',
  10
);
