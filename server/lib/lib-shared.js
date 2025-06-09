const uuid = require("uuid");
const crypto = require("crypto");
const moment = require("moment-timezone");

function libShared() {}

libShared.money = "RM";
libShared.imgFormat = [
  ".jpeg",
  ".jpg",
  ".png",
  ".gif",
  ".ico",
  ".bmp",
  ".tif",
  ".tiff",
  ".jpe",
  ".jfif",
];

// Timezone
const timezone = "Asia/Kuala_Lumpur";

// Encrypt Logic
const algorithm = "aes-256-cbc";
const key = crypto
  .createHash("sha256")
  .update(String("your-secret-key"))
  .digest("base64")
  .substr(0, 32); // Fixed 32-byte key

/**
 * // Handle undefined and null
 * @param {string} v
 * @returns
 */
libShared.isUndefinedOrNull = function (v) {
  return typeof v === undefined || v === null;
};

/**
 *
 * @param {string} v
 * @returns
 */
libShared.toString = function (v) {
  if (libShared.isUndefinedOrNull(v)) {
    return null;
  }

  if (typeof v === "string") {
    return v;
  }

  if (v.length > 255) {
    return v.substring(0, 255);
  }

  return String(v);
};

/**
 * // Handle Data Type Text in Postgresql
 * @param {string} v
 * @returns
 */
libShared.toText = function (v) {
  if (libShared.isUndefinedOrNull(v)) {
    return "";
  }

  return String(v);
};

libShared.toInt = function (v) {
  if (libShared.isUndefinedOrNull(v)) {
    return 0;
  }

  const parsed = parseInt(v, 10);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
};

libShared.toFloat = function (v) {
  if (libShared.isUndefinedOrNull(v)) {
    return 0.0;
  }

  const parsed = parseFloat(v);
  
  if (!isNaN(parsed)) {
    return parseFloat(parsed.toFixed(2));
  }

  return 0.0;
};

libShared.toNewGuid = function () {
  return uuid.v4();
};

libShared.toUUID = function (v) {
  if (libShared.isUndefinedOrNull(v)) {
    return null;
  }

  if (v.length === 36) {
    return `${v.toString()}`;
  }

  return null;
};

libShared.toShortDate = function (v, timezone) {
  // If v is already a Date object, return it directly
  if (v instanceof Date) {
    return v;
  }

  // If v is null or undefined, return null
  if (libShared.isUndefinedOrNull(v)) {
    return null;
  }

  // Try to parse the value as a date (handle date strings or numeric timestamps)
  const date = moment.tz(v, timezone);

  // If the parsed date is invalid, return null
  if (!date.isValid) {
    return null;
  }

  return date.toDate();
};

libShared.toDate = function (v, timezone) {
  // If v is already a Date object, return it directly
  if (v instanceof Date) {
    return v;
  }

  // If v is null or undefined, return null
  if (libShared.isUndefinedOrNull(v)) {
    return null;
  }

  // Try to parse the value as a date (handle date strings or numeric timestamps)
  const date = moment.tz(v, timezone);

  // If the parsed date is invalid, return null
  if (!date.isValid()) {
    return null;
  }

  // Otherwise, return the valid date
  return date.format("YYYY-MM-DD");
};

libShared.toDateTime = function (v) {
  // If v is already a Date object, return it directly
  if (v instanceof Date) {
    return v;
  }

  // If v is null or undefined, return null
  if (libShared.isUndefinedOrNull(v)) {
    return null;
  }

  // Try to parse the value as a datetime (handle datetime strings or numeric timestamps)
  const dateTime = moment(v).tz(timezone);

  // If the parsed datetime is invalid, return null
  if (!dateTime.isValid()) {
    return null;
  }

  // Otherwise, return the valid DateTime
  return dateTime.format("YYYY-MM-DD HH:mm:ss");
};

libShared.getDate = function (mode = 'standard') {
  const now = moment().tz("Asia/Kuala_Lumpur");

  if (mode === 'withMeridiem') {
    return now.format("YYYY-MM-DD HH:mm:ss A"); // With AM/PM
  }

  return now.format("YYYY-MM-DD HH:mm:ss"); // Standard 24-hour format
};

/**
 * 
 * @param {dateTime} dt 
 * @param {int} dur 
 * @param {string} type 
 * years	y
 * quarters	Q
 * months	M
 * weeks	w
 * days	d
 * hours	h
 * minutes	m
 * seconds	s
 * milliseconds	ms
 * @returns 
 */
libShared.addTime = function (dt, dur, type) {
  if (!dt || !dur || !type) return null;

  const dateTime = moment(dt).tz(timezone);

  if (!dateTime.isValid()) {
    return null;
  }

  const add = moment(dateTime).add(dur, type);

  return add.format("YYYY-MM-DD HH:mm:ss")
}

libShared.padFillLeft = function (str, length, char) {
  if (str.length >= length) {
    return str;
  }

  if (libShared.isUndefinedOrNull(char)) {
    char = "0";
  }

  return char.repeat(length - str.length) + str;
};

libShared.hashText = function (v) {
  let h = crypto.createHash("sha256");
  h.update(v, "utf8");
  return h.digest("hex");
};

libShared.convertObjProp = function (o, defObj, conversionMap) {
  const convert = (key, value) => {
    //console.log('Key:', key);           // Log the key
    //console.log('Value before conversion:', value); // Log value before conversion

    const converter = conversionMap[key]; // Get the specific converter for this key
    //console.log('Converter function:', converter ? converter.toString() : 'No converter'); // Log the function or no converter message

    if (converter) {
      const convertedValue = converter(value); // Apply custom conversion logic
      //console.log('Converted Value:', convertedValue); // Log the result after conversion
      return convertedValue;
    }

    //console.log('No conversion applied. Returning original value:', value); // Log when no conversion happens
    return value; // If no converter, return the value as-is
  };

  return Object.keys(defObj).reduce((acc, key) => {
    const value = o[key] !== undefined ? o[key] : defObj[key];
    acc[key] = convert(key, value);
    return acc;
  }, {});
};

/**
 * Encrypts a given text.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} - The encrypted text in base64 format.
 */
libShared.encrypt = function (text) {
  const iv = crypto.randomBytes(16); // Generate a unique IV per encryption
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return `${iv.toString("base64")}:${encrypted}`; // Include IV in output
};

/**
 * Decrypts a given encrypted text.
 * @param {string} encryptedData - The encrypted text in base64 format.
 * @returns {string} - The decrypted plain text.
 */
libShared.decrypt = function (encryptedData) {
  const [ivString, encryptedText] = encryptedData.split(":");
  const iv = Buffer.from(ivString, "base64");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = libShared;
