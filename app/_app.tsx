"use client"

import { useEffect } from "react"
import { apiService } from "@/lib/api-service"

export function InitializeApp() {
  useEffect(() => {
    // Inicializar datos al cargar la aplicación
    apiService.init()
    console.log("Datos inicializados correctamente")
  }, [])

  return null
}
