require("dotenv").config();
const SharedAPI = require("./api-shared");

const BASE_URL = process.env.BASE_URL;

/**
 * Validate TIN Number
 * @param {string} tin 
 * @param {string} idType 
 * @param {string} idValue 
 * @param {object} auth 
 * @returns 
 */
async function validateTIN(tin, idType, idValue, auth = {}) {
  if (!tin) throw new Error("TIN Number is required");
  if (!idType) throw new Error("ID Type is required");
  if (!idValue) throw new Error("ID Value is required");

  let url = `https://${BASE_URL}//api/v1.0/taxpayer/validate/${tin}?idType=${idType}&idValue=${idValue}`;

  const token = await SharedAPI.systemLogin({
    clientId: auth.cid || process.env.client_id,
    clientSecret: auth.cs || process.env.clientSecret,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to validate TIN: ${errText}`);
  }

  const { result } = await response.json();
  return result;
}

// Search TIN Number
/**
 * 
 * @param {string} idType 
 * @param {string} idValue 
 * @param {string} taxpayerName 
 * @param {object} auth 
 * @returns 
 */
async function searchTIN(idType, idValue, taxpayerName, auth = {}) {
  if (!idType) throw new Error("ID Type is required");
  if (!idValue) throw new Error("ID Value is required");
  if (!taxpayerName) throw new Error("Taxpayer Name is required");

  let url = `https://${BASE_URL}/api/v1.0/taxpayer/search/tin?idType=${idType}&idValue=${idValue}&taxpayerName=${taxpayerName}`;

  const token = await SharedAPI.systemLogin({
    clientId: auth.cid || process.env.client_id,
    clientSecret: auth.cs || process.env.clientSecret,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to search TIN: ${errText}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get Taxpayer QR Code
 * @param {string} qrCodeText 
 * @param {object} auth 
 */
async function getTaxpayerQr (qrCodeText, auth = {}) {
  const url = `https://${BASE_URL}/api/v1.0/taxpayers/qrcodeinfo/${qrCodeText}`

  const token = await SharedAPI.systemLogin({
    clientId: auth.cid || process.env.client_id,
    clientSecret: auth.cs || process.env.clientSecret,
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to search TIN: ${errText}`);
  }

  const data = await response.json();
  return data.result;
}