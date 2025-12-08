
// This service handles the "locking" of the app to a specific device.

const STORAGE_KEY = 'food_scanner_auth_token';
const DEVICE_ID_KEY = 'food_scanner_device_id';

// ------------------------------------------------------------------
// PASTE YOUR GOOGLE SCRIPT WEB APP URL BELOW
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"
// ------------------------------------------------------------------
const API_ENDPOINT: string = "https://script.google.com/macros/s/AKfycbyNhUx7aFh0f22vqXOACgF3J7gPLlZU_SwOzF4z3v4KBWzil2oFuQXsiG_8MupotPi8/exec"; 
// ------------------------------------------------------------------


// Generate a random device ID if one doesn't exist
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};

interface ValidationResult {
    valid: boolean;
    message?: string;
}

export const validateAccessCode = async (code: string, deviceId: string): Promise<ValidationResult> => {
  const normalizedCode = code.trim().toUpperCase();

  // 1. Special bypass for your testing (Always allowed on any device)
  if (normalizedCode === 'RAFF-TEST') {
      localStorage.setItem(STORAGE_KEY, 'valid_session_test');
      return { valid: true };
  }

  // 2. Remote Validation (Strict "One Device" Policy via Google Sheet)
  if (API_ENDPOINT && API_ENDPOINT.length > 5) {
      try {
          // 'redirect: follow' is required for Google Apps Script Web Apps
          const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              redirect: 'follow', 
              headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'text/plain' avoids CORS preflight issues with GAS
              body: JSON.stringify({ action: 'verify', code: normalizedCode, deviceId: deviceId })
          });

          const data = await response.json();
          
          if (data.valid) {
              localStorage.setItem(STORAGE_KEY, 'valid_session_' + Date.now());
              return { valid: true };
          } else {
              return { valid: false, message: data.message || "Invalid or used code" };
          }
      } catch (error) {
          console.error("Validation error", error);
          return { valid: false, message: "Connection failed. Please check internet." };
      }
  }

  // 3. Local Fallback (Only runs if you haven't pasted the URL yet)
  // WARNING: This DOES NOT enforce "One Device" across the internet. 
  // It only checks if the code exists in this list.
  
  await new Promise(resolve => setTimeout(resolve, 800));

  const validCodes = [
    "X7K9-M2P4", "Q3L8-R5T1", "A9J4-B6V2", "W2N7-X5Z8", "E4R9-T1Y6",
    "U8I3-O2P5", "S6D4-F9G2", "H1J7-K5L3", "Z8X2-C4V6", "B3N9-M1Q5",
    "W4E7-R2T8", "Y6U1-I9O3", "P5A8-S2D4", "F7G3-H9J1", "K2L6-Z8X4",
    "C5V9-B1N3", "M7Q2-W4E6", "R9T1-Y3U5", "I8O4-P6A2", "S9D1-F3G5",
    "H7J2-K4L8", "Z6X9-C1V3", "B5N2-M8Q4", "W7E1-R3T9", "Y5U8-I2O6",
    "P4A9-S1D3", "F2G6-H8J4", "K9L1-Z3X7", "C2V5-B8N4", "M6Q9-W1E3",
    "R5T2-Y8U4", "I1O7-P3A9", "S5D8-F2G6", "H9J3-K1L7", "Z4X6-C2V8",
    "B1N5-M9Q3", "W8E2-R4T6", "Y1U7-I3O9", "P2A6-S8D1", "F9G5-H2J4",
    "K3L7-Z1X9", "C6V2-B4N8", "M5Q1-W9E3", "R8T4-Y2U6", "I3O5-P9A1",
    "S2D7-F4G8", "H6J9-K2L3", "Z1X5-C7V9", "B8N3-M6Q2", "W9E4-R1T7",
    "Y2U5-I8O4", "P6A3-S9D2", "F1G8-H5J7", "K4L2-Z6X1", "C9V3-B5N7",
    "M2Q8-W6E4", "R1T9-Y5U2", "I7O3-P1A6", "S8D5-F7G9", "H2J6-K9L4",
    "Z3X1-C5V8", "B4N7-M2Q6", "W5E9-R8T3", "Y7U4-I1O2", "P9A5-S3D7",
    "F6G1-H4J8", "K8L4-Z2X6", "C1V7-B9N5", "M3Q6-W8E2", "R7T5-Y1U9",
    "I5O2-P4A8", "S3D9-F1G6", "H4J1-K7L5", "Z9X3-C6V2", "B2N8-M5Q1",
    "W6E3-R9T7", "Y4U2-I6O8", "P1A7-S5D3", "F8G4-H6J2", "K5L9-Z7X1",
    "C3V6-B2N9", "M9Q4-W1E5", "R2T7-Y6U3", "I9O1-P8A5", "S4D2-F6G8",
    "H5J8-K3L9", "Z7X4-C1V2", "B6N1-M3Q7", "W3E5-R7T9", "Y9U6-I4O2",
    "P8A1-S7D5", "F3G9-H2J6", "K1L5-Z4X8", "C7V3-B6N2", "M4Q8-W2E9",
    "R6T1-Y9U5", "I2O8-P3A7", "S1D4-F5G9", "H8J2-K6L3", "Z5X7-C9V1"
  ];
  
  if (validCodes.includes(normalizedCode)) {
    // Lock the session
    localStorage.setItem(STORAGE_KEY, 'valid_session_' + Date.now());
    return { valid: true };
  }
  
  return { valid: false, message: "Invalid code. Please try again." };
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
};
