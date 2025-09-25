const API_BASE_URL = "/v1";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get(endpoint: string, options?: RequestOptions) {
    const response = await this.request(endpoint, { ...options, method: "GET" });
    return response.json();
  }

  async post(endpoint: string, data?: any, options?: RequestOptions) {
    const response = await this.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async put(endpoint: string, data?: any, options?: RequestOptions) {
    const response = await this.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }

  async delete(endpoint: string, options?: RequestOptions) {
    const response = await this.request(endpoint, { ...options, method: "DELETE" });
    return response.json();
  }

  async patch(endpoint: string, data?: any, options?: RequestOptions) {
    const response = await this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  }
}

export const api = new ApiClient();

export const quotesApi = {
  getAll: () => api.get("/quotes"),
  getById: (id: string) => api.get(`/quotes/${id}`),
  create: (data: any) => api.post("/quotes", data),
  update: (id: string, data: any) => api.put(`/quotes/${id}`, data),
  delete: (id: string) => api.delete(`/quotes/${id}`),
  getRandom: () => api.get("/quotes/random"),
};

export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }, { skipAuth: true }),
  logout: () => api.post("/auth/logout"),
  validate: () => api.get("/auth/validate"),
};
