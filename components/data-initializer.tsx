"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function DataInitializer() {
  const { toast } = useToast()

  useEffect(() => {
    // Función para inicializar datos en localStorage si no existen
    const initializeLocalStorage = () => {
      try {
        // Verificar si ya existen datos en localStorage
        const products = localStorage.getItem("products")
        const users = localStorage.getItem("users")
        const orders = localStorage.getItem("orders")

        // Si no existen, inicializar con datos de prueba
        if (!products) {
          const mockProducts = generateMockProducts()
          localStorage.setItem("products", JSON.stringify(mockProducts))
        }

        if (!users) {
          const mockUsers = generateMockUsers()
          localStorage.setItem("users", JSON.stringify(mockUsers))
        }

        if (!orders) {
          const mockOrders = generateMockOrders()
          localStorage.setItem("orders", JSON.stringify(mockOrders))
        }

        console.log("Datos inicializados correctamente en localStorage")
      } catch (error) {
        console.error("Error al inicializar datos en localStorage:", error)
        toast({
          title: "Error al inicializar datos",
          description: "No se pudieron cargar los datos de prueba. Intente recargar la página.",
          variant: "destructive",
        })
      }
    }

    // Generar productos de prueba
    function generateMockProducts() {
      return [
        // CPUs
        {
          id: "cpu-1",
          type: "cpu",
          name: "AMD Ryzen 7 5800X",
          brand: "AMD",
          price: 349.99,
          stock: 15,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            cores: 8,
            threads: 16,
            baseFrequency: "3.8 GHz",
            boostFrequency: "4.7 GHz",
            tdp: 105,
            socket: "AM4",
          },
        },
        {
          id: "cpu-2",
          type: "cpu",
          name: "Intel Core i9-12900K",
          brand: "Intel",
          price: 589.99,
          stock: 10,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            cores: 16,
            threads: 24,
            baseFrequency: "3.2 GHz",
            boostFrequency: "5.2 GHz",
            tdp: 125,
            socket: "LGA1700",
          },
        },
        // Motherboards
        {
          id: "mb-1",
          type: "motherboard",
          name: "ASUS ROG Strix B550-F Gaming",
          brand: "ASUS",
          price: 189.99,
          stock: 12,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            socket: "AM4",
            chipset: "B550",
            memorySlots: 4,
            maxMemory: 128,
            formFactor: "ATX",
          },
        },
        {
          id: "mb-2",
          type: "motherboard",
          name: "MSI MPG Z690 Gaming Edge WiFi",
          brand: "MSI",
          price: 289.99,
          stock: 8,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            socket: "LGA1700",
            chipset: "Z690",
            memorySlots: 4,
            maxMemory: 128,
            formFactor: "ATX",
          },
        },
        // RAM
        {
          id: "ram-1",
          type: "ram",
          name: "Corsair Vengeance RGB Pro 32GB",
          brand: "Corsair",
          price: 149.99,
          stock: 20,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            capacity: 32,
            speed: 3600,
            type: "DDR4",
            modules: 2,
          },
        },
        {
          id: "ram-2",
          type: "ram",
          name: "G.Skill Trident Z Neo 64GB",
          brand: "G.Skill",
          price: 329.99,
          stock: 5,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            capacity: 64,
            speed: 3600,
            type: "DDR4",
            modules: 4,
          },
        },
        // GPUs
        {
          id: "gpu-1",
          type: "gpu",
          name: "NVIDIA GeForce RTX 3080",
          brand: "NVIDIA",
          price: 699.99,
          stock: 3,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            memory: 10,
            memoryType: "GDDR6X",
            coreClock: "1440 MHz",
            boostClock: "1710 MHz",
            tdp: 320,
          },
        },
        {
          id: "gpu-2",
          type: "gpu",
          name: "AMD Radeon RX 6800 XT",
          brand: "AMD",
          price: 649.99,
          stock: 4,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            memory: 16,
            memoryType: "GDDR6",
            coreClock: "1825 MHz",
            boostClock: "2250 MHz",
            tdp: 300,
          },
        },
        // Storage
        {
          id: "storage-1",
          type: "storage",
          name: "Samsung 970 EVO Plus 1TB",
          brand: "Samsung",
          price: 129.99,
          stock: 25,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            capacity: 1,
            type: "NVMe SSD",
            readSpeed: 3500,
            writeSpeed: 3300,
            interface: "PCIe 3.0 x4",
          },
        },
        {
          id: "storage-2",
          type: "storage",
          name: "Western Digital Black 4TB",
          brand: "Western Digital",
          price: 149.99,
          stock: 15,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            capacity: 4,
            type: "HDD",
            readSpeed: 180,
            writeSpeed: 180,
            interface: "SATA 6Gb/s",
          },
        },
        // PSUs
        {
          id: "psu-1",
          type: "psu",
          name: "Corsair RM850x",
          brand: "Corsair",
          price: 139.99,
          stock: 10,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            wattage: 850,
            efficiency: "80+ Gold",
            modular: "Full",
            fanSize: 135,
          },
        },
        {
          id: "psu-2",
          type: "psu",
          name: "EVGA SuperNOVA 1000 G5",
          brand: "EVGA",
          price: 189.99,
          stock: 7,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            wattage: 1000,
            efficiency: "80+ Gold",
            modular: "Full",
            fanSize: 135,
          },
        },
        // Cases
        {
          id: "case-1",
          type: "case",
          name: "Fractal Design Meshify C",
          brand: "Fractal Design",
          price: 99.99,
          stock: 8,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            formFactor: "ATX Mid Tower",
            dimensions: "395mm x 212mm x 440mm",
            weight: 6.7,
            material: "Steel, Tempered Glass",
          },
        },
        {
          id: "case-2",
          type: "case",
          name: "Lian Li O11 Dynamic",
          brand: "Lian Li",
          price: 149.99,
          stock: 6,
          image: "/placeholder.svg?height=200&width=200",
          specs: {
            formFactor: "ATX Full Tower",
            dimensions: "445mm x 272mm x 446mm",
            weight: 9.7,
            material: "Aluminum, Tempered Glass",
          },
        },
      ]
    }

    // Generar usuarios de prueba
    function generateMockUsers() {
      return [
        {
          id: "user-1",
          name: "Admin Usuario",
          email: "admin@example.com",
          role: "admin",
          createdAt: "2023-01-15T10:30:00Z",
        },
        {
          id: "user-2",
          name: "Cliente Ejemplo",
          email: "cliente@example.com",
          role: "user",
          createdAt: "2023-02-20T14:45:00Z",
        },
      ]
    }

    // Generar pedidos de prueba
    function generateMockOrders() {
      return [
        {
          id: "order-1",
          userId: "user-2",
          items: [
            { productId: "cpu-1", quantity: 1, price: 349.99 },
            { productId: "mb-1", quantity: 1, price: 189.99 },
            { productId: "ram-1", quantity: 1, price: 149.99 },
          ],
          total: 689.97,
          status: "completed",
          createdAt: "2023-03-10T09:15:00Z",
          shippingAddress: {
            street: "Calle Ejemplo 123",
            city: "Madrid",
            state: "Madrid",
            zipCode: "28001",
            country: "España",
          },
        },
        {
          id: "order-2",
          userId: "user-2",
          items: [
            { productId: "gpu-1", quantity: 1, price: 699.99 },
            { productId: "psu-1", quantity: 1, price: 139.99 },
          ],
          total: 839.98,
          status: "processing",
          createdAt: "2023-04-05T16:20:00Z",
          shippingAddress: {
            street: "Avenida Test 456",
            city: "Barcelona",
            state: "Cataluña",
            zipCode: "08001",
            country: "España",
          },
        },
      ]
    }

    // Inicializar datos
    initializeLocalStorage()
  }, [toast])

  return null
}
