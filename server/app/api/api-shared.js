require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
let cachedToken = null;
let tokenExpiry = null;

// Login as Taxpayer & Intermediary System
async function systemLogin() {
  const now = Date.now();

  // Reuse token if not expired
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    console.log("Old Token: ", cachedToken);

    return cachedToken;
  }

  const url = `https://${BASE_URL}/connect/token`;

  const payload = new URLSearchParams();
  payload.append("client_id", process.env.clientId);
  payload.append("client_secret", process.env.clientSecret);
  payload.append("grant_type", "client_credentials");
  payload.append("scope", "InvoicingAPI");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Login failed: ${errText}`);
  }

  const data = await response.json();

  // Cache the access token and set expiry timestamp
  cachedToken = `${data.token_type} ${data.access_token}`;
  tokenExpiry = now + data.expires_in * 1000 - 60000; // subtract 60s buffer
  console.log("New Token: ", cachedToken);

  return cachedToken;
}

/**
 * Get All Document Types /api/v1.0/documenttypes
 * Get Document Type /api/v1.0/documenttypes/{id}
 * Get Document Type Version /api/v1.0/documenttypes/{id}/versions/{vid}
 * @param {string} id
 * @param {string} versionId
 * @returns
 */
async function getDocType(id = null, versionId = null) {
  let url = `https://${BASE_URL}/api/v1.0/documenttypes`;

  if (id && versionId) {
    url += `/${id}/versions/${versionId}`;
  } else if (id) {
    url += `/${id}`;
  }

  const token = await systemLogin();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to get document type: ${errText}`);
  }

  const data = await response.json();
  return data.result;
}

/**
 * Get Notification
 * @param {string} dateFrom
 * @param {string} dateTo
 * @param {string} type
 * @param {string} language
 * @param {string} status
 * @param {string} pageNo
 * @param {string} pageSize
 * @returns
 */
async function getNotif(
  dateFrom,
  dateTo,
  type,
  language,
  status,
  pageNo,
  pageSize
) {
  const params = new URLSearchParams({
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
    ...(type && { type }),
    ...(language && { language }),
    ...(status && { status }),
    ...(pageNo && { pageNo: pageNo.toString() }),
    ...(pageSize && { pageSize: pageSize.toString() }),
  });

  const url = `https://${BASE_URL}/api/v1.0/notifications/taxpayer?${params.toString()}`;

  const token = await systemLogin();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Notification fetch failed: ${errText}`);
  }

  const data = await response.json();
  return data;
}

module.exports = { systemLogin, getDocType, getNotif };