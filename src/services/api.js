const API_URL = import.meta.env.VITE_API_URL || "http://15.237.178.217:4000";
export const STORAGE_KEY = "savings-auth-profile";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}/api${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    const error = payload.error || "Error al comunicarse con el servidor";
    throw new Error(error);
  }

  return payload;
};

export const registerUser = async ({ name, email, password }) => {
  try {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return { ok: true, profile: data.profile };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return { ok: true, profile: data.profile };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export const refreshSyncCode = async (token) => {
  const data = await request("/auth/sync-code", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.profile;
};

export const getUserData = async (token) => {
  const data = await request("/records", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data;
};

export const saveUserData = async (token, payload) => {
  await request("/records", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
};
