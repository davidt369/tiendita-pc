"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/stores/cart-store"
import { mockData } from "@/lib/mock-data"

interface ProductRecommendationProps {
  type?: string
  title?: string
  count?: number
  showViewAll?: boolean
}

export function ProductRecommendation({
  type = "all",
  title = "Productos recomendados",
  count = 4,
  showViewAll = true,
}: ProductRecommendationProps) {
  const { toast } = useToast()
  const addToCart = useCartStore((state) => state.addItem)
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estado para el tipo de cambio
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)

  // Efecto para leer el tipo de cambio desde localStorage
  useEffect(() => {
    const loadExchangeRate = () => {
      const storedRate = localStorage.getItem('exchangeRate')
      if (storedRate) {
        const numericRate = parseFloat(storedRate)
        if (!isNaN(numericRate)) {
          setExchangeRate(numericRate)
        }
      }
    }

    // Cargar el tipo de cambio inicial
    loadExchangeRate()

    // Escuchar cambios en localStorage (cuando se actualiza desde el admin)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'exchangeRate') {
        loadExchangeRate()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // También escuchar cambios en la misma pestaña usando un evento personalizado
    const handleCustomStorageChange = () => {
      loadExchangeRate()
    }

    window.addEventListener('exchangeRateChanged', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('exchangeRateChanged', handleCustomStorageChange)
    }
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        // Simular un retraso para mostrar el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 1000))

        let productList: any[] = []

        if (type === "all" || type === "featured") {
          // Mezclar productos de diferentes categorías
          productList = [
            ...mockData.cpu.slice(0, 2).map((item) => ({ ...item, tipo: "cpu" })),
            ...mockData.gpu.slice(0, 2).map((item) => ({ ...item, tipo: "gpu" })),
            ...mockData.ram.slice(0, 2).map((item) => ({ ...item, tipo: "ram" })),
            ...mockData.placa_madre.slice(0, 2).map((item) => ({ ...item, tipo: "motherboard" })),
          ]
        } else {
          // Filtrar por tipo específico
          switch (type) {
            case "cpu":
              productList = mockData.cpu.map((item) => ({ ...item, tipo: "cpu" }))
              break
            case "gpu":
              productList = mockData.gpu.map((item) => ({ ...item, tipo: "gpu" }))
              break
            case "ram":
              productList = mockData.ram.map((item) => ({ ...item, tipo: "ram" }))
              break
            case "motherboard":
              productList = mockData.placa_madre.map((item) => ({ ...item, tipo: "motherboard" }))
              break
            case "storage":
              productList = mockData.almacenamiento.map((item) => ({ ...item, tipo: "storage" }))
              break
            case "psu":
              productList = mockData.fuente.map((item) => ({ ...item, tipo: "psu" }))
              break
            case "case":
              productList = mockData.gabinete.map((item) => ({ ...item, tipo: "case" }))
              break
            case "peripheral":
              productList = mockData.perifericos.map((item) => ({ ...item, tipo: "peripheral" }))
              break
          }
        }

        // Mezclar aleatoriamente y limitar al número solicitado
        productList = productList.sort(() => 0.5 - Math.random()).slice(0, count)

        setProducts(productList)
      } catch (error) {
        console.error("Error al cargar productos recomendados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [type, count])

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      type: product.tipo,
      name: product.nombre,
      price: product.precio,
      quantity: 1,
      image: product.imagen_url,
    })

    toast({
      title: "Producto añadido al carrito",
      description: `${product.nombre} ha sido añadido a tu carrito.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {showViewAll && (
          <Button variant="link" asChild>
            <Link href={type === "all" ? "/products" : `/products?type=${type}`}>
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={`${product.tipo}-${product.id}`} className="overflow-hidden">
              <div className="relative h-48 bg-muted">
                <Image
                  src={product.imagen_url || "/placeholder.svg?height=192&width=256"}
                  alt={product.nombre}
                  fill
                  className="object-contain p-4"
                />
              </div>              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-2 mb-1 h-12">{product.nombre}</h3>
                <div className="space-y-1">
                  <div className="text-lg font-bold">${product.precio.toFixed(2)} USD</div>
                  {exchangeRate && (
                    <div className="text-md font-semibold text-green-600">
                      {(product.precio * exchangeRate).toFixed(2)} Bs.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/products/${product.tipo}/${product.id}`}>Ver detalles</Link>
                </Button>
                <Button onClick={() => handleAddToCart(product)}>Añadir</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
