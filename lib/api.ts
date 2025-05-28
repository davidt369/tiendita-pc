import axios from "axios"

// Crear una instancia de axios con configuración base
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    // En un entorno real, obtendríamos el token del almacenamiento local o de las cookies
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response?.status === 401) {
      // Redirigir a la página de login o refrescar el token
      if (typeof window !== "undefined") {
        // window.location.href = "/auth/login"
      }
    }

    return Promise.reject(error)
  },
)
