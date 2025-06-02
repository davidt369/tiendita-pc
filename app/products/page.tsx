"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, Search, SlidersHorizontal, Cpu, HardDrive, MemoryStickIcon as Memory, Tv2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/stores/cart-store"
import { mockData } from "@/lib/mock-data"
import { apiService } from "@/lib/api-service"

// Tipos para los productos
export type ProductType = "cpu" | "gpu" | "ram" | "motherboard" | "storage" | "psu" | "case" | "peripheral"

interface Product {
  id: number
  nombre: string
  precio: number
  imagen_url?: string
  tipo: ProductType
  marca?: string
  [key: string]: any // Para otras propiedades específicas de cada tipo
}

// Función para obtener el icono según el tipo de producto
const getProductIcon = (type: ProductType) => {
  switch (type) {
    case "cpu":
      return <Cpu className="h-4 w-4" />
    case "gpu":
      return <Tv2 className="h-4 w-4" />
    case "ram":
      return <Memory className="h-4 w-4" />
    case "storage":
      return <HardDrive className="h-4 w-4" />
    default:
      return null
  }
}

// Función para obtener el nombre del tipo de producto en español
const getProductTypeName = (type: ProductType) => {
  switch (type) {
    case "cpu":
      return "Procesador"
    case "gpu":
      return "Tarjeta Gráfica"
    case "ram":
      return "Memoria RAM"
    case "motherboard":
      return "Placa Madre"
    case "storage":
      return "Almacenamiento"
    case "psu":
      return "Fuente de Poder"
    case "case":
      return "Gabinete"
    case "peripheral":
      return "Periférico"
    default:
      return type
  }
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const addToCart = useCartStore((state) => state.addItem)

  // Estado para los productos
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

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

  // Estado para los filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>(searchParams.get("type") || "all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState<string>("featured")

  // Obtener marcas únicas para el filtro
  const [brands, setBrands] = useState<string[]>([])

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)

        // Inicializar datos de prueba primero
        apiService.init()

        // Esperar un momento para asegurar que los datos se han inicializado
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Ahora cargar los productos
        const data = await apiService.getProducts()

        // Convertir los datos de mockData a un array de productos si no hay datos
        if (!data || data.length === 0) {
          const allProducts: Product[] = [
            ...mockData.cpu.map((item) => ({ ...item, tipo: "cpu" as ProductType, marca: "Intel" })),
            ...mockData.gpu.map((item) => ({ ...item, tipo: "gpu" as ProductType, marca: "NVIDIA" })),
            ...mockData.ram.map((item) => ({ ...item, tipo: "ram" as ProductType, marca: "Corsair" })),
            ...mockData.placa_madre.map((item) => ({ ...item, tipo: "motherboard" as ProductType, marca: "ASUS" })),
            ...mockData.almacenamiento.map((item) => ({ ...item, tipo: "storage" as ProductType, marca: "Samsung" })),
            ...mockData.fuente.map((item) => ({ ...item, tipo: "psu" as ProductType, marca: "Corsair" })),
            ...mockData.gabinete.map((item) => ({ ...item, tipo: "case" as ProductType, marca: "NZXT" })),
            ...mockData.perifericos.map((item) => ({ ...item, tipo: "peripheral" as ProductType, marca: "Logitech" })),
          ]
          setProducts(allProducts)
          setFilteredProducts(allProducts)
        } else {
          setProducts(data)
          setFilteredProducts(data)
        }

        // Extraer marcas únicas
        const uniqueBrands = Array.from(new Set(data.map((product) => product.marca))).filter(Boolean) as string[]
        setBrands(uniqueBrands.length > 0 ? uniqueBrands : ["Intel", "AMD", "NVIDIA", "Corsair", "ASUS"])

        // Aplicar filtro inicial si hay un tipo en la URL
        if (searchParams.get("type") && searchParams.get("type") !== "all") {
          setFilteredProducts(data.filter((product) => product.tipo === searchParams.get("type")))
        }
      } catch (error) {
        console.error("Error al cargar productos:", error)
        toast({
          variant: "destructive",
          title: "Error al cargar productos",
          description: "No se pudieron cargar los productos. Inténtalo de nuevo más tarde.",
        })

        // Cargar datos de respaldo desde mockData
        const backupProducts: Product[] = [
          ...mockData.cpu.map((item) => ({ ...item, tipo: "cpu" as ProductType, marca: "Intel" })),
          ...mockData.gpu.map((item) => ({ ...item, tipo: "gpu" as ProductType, marca: "NVIDIA" })),
          ...mockData.ram.map((item) => ({ ...item, tipo: "ram" as ProductType, marca: "Corsair" })),
          ...mockData.placa_madre.map((item) => ({ ...item, tipo: "motherboard" as ProductType, marca: "ASUS" })),
          ...mockData.almacenamiento.map((item) => ({ ...item, tipo: "storage" as ProductType, marca: "Samsung" })),
          ...mockData.fuente.map((item) => ({ ...item, tipo: "psu" as ProductType, marca: "Corsair" })),
          ...mockData.gabinete.map((item) => ({ ...item, tipo: "case" as ProductType, marca: "NZXT" })),
          ...mockData.perifericos.map((item) => ({ ...item, tipo: "peripheral" as ProductType, marca: "Logitech" })),
        ]
        setProducts(backupProducts)
        setFilteredProducts(backupProducts)
        setBrands(["Intel", "AMD", "NVIDIA", "Corsair", "ASUS"])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams, toast])

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let filtered = [...products]

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter((product) => product.tipo === selectedType)
    }

    // Filtrar por marca
    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) => product.marca === selectedBrand)
    }

    // Filtrar por rango de precio
    filtered = filtered.filter((product) => product.precio >= priceRange[0] && product.precio <= priceRange[1])

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((product) => product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Ordenar productos
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.precio - b.precio)
        break
      case "price-desc":
        filtered.sort((a, b) => b.precio - a.precio)
        break
      case "name-asc":
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case "name-desc":
        filtered.sort((a, b) => b.nombre.localeCompare(a.nombre))
        break
      // El caso "featured" no necesita ordenamiento adicional
    }

    setFilteredProducts(filtered)
  }, [selectedType, selectedBrand, priceRange, searchTerm, sortBy, products])

  // Función para manejar la adición al carrito
  const handleAddToCart = (product: Product) => {
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

  // Función para manejar el cambio de tipo
  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    // Actualizar la URL para reflejar el filtro
    if (value === "all") {
      router.push("/products")
    } else {
      router.push(`/products?type=${value}`)
    }
  }

  // Calcular el precio máximo para el slider
  const maxPrice = Math.max(...products.map((product) => product.precio), 2000)

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtros para pantallas grandes */}
        <div className="hidden lg:block w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-3">Categorías</h3>
            <div className="space-y-2">
              <Button
                variant={selectedType === "all" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("all")}
              >
                Todos los productos
              </Button>
              <Button
                variant={selectedType === "cpu" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("cpu")}
              >
                <Cpu className="mr-2 h-4 w-4" />
                Procesadores
              </Button>
              <Button
                variant={selectedType === "motherboard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("motherboard")}
              >
                Placas Madre
              </Button>
              <Button
                variant={selectedType === "ram" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("ram")}
              >
                <Memory className="mr-2 h-4 w-4" />
                Memoria RAM
              </Button>
              <Button
                variant={selectedType === "gpu" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("gpu")}
              >
                <Tv2 className="mr-2 h-4 w-4" />
                Tarjetas Gráficas
              </Button>
              <Button
                variant={selectedType === "storage" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("storage")}
              >
                <HardDrive className="mr-2 h-4 w-4" />
                Almacenamiento
              </Button>
              <Button
                variant={selectedType === "psu" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("psu")}
              >
                Fuentes de Poder
              </Button>
              <Button
                variant={selectedType === "case" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("case")}
              >
                Gabinetes
              </Button>
              <Button
                variant={selectedType === "peripheral" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleTypeChange("peripheral")}
              >
                Periféricos
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Marca</h3>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-medium mb-3">Rango de precio</h3>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={maxPrice}
                step={10}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex items-center justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Ordenar por</SelectLabel>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                    <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                    <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Filtros para móviles */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Filter className="h-4 w-4" />
                    <span className="sr-only">Filtros</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Ajusta los filtros para encontrar los productos que buscas</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Categorías</h3>
                      <Select value={selectedType} onValueChange={handleTypeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          <SelectItem value="cpu">Procesadores</SelectItem>
                          <SelectItem value="motherboard">Placas Madre</SelectItem>
                          <SelectItem value="ram">Memoria RAM</SelectItem>
                          <SelectItem value="gpu">Tarjetas Gráficas</SelectItem>
                          <SelectItem value="storage">Almacenamiento</SelectItem>
                          <SelectItem value="psu">Fuentes de Poder</SelectItem>
                          <SelectItem value="case">Gabinetes</SelectItem>
                          <SelectItem value="peripheral">Periféricos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Marca</h3>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las marcas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las marcas</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Rango de precio</h3>
                      <div className="space-y-4">
                        <Slider
                          value={priceRange}
                          min={0}
                          max={maxPrice}
                          step={10}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex items-center justify-between">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button>Aplicar filtros</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Resultados */}
          <div>
            <div className="mb-4">
              <p className="text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? "resultado" : "resultados"}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
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
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <SlidersHorizontal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                <p className="text-muted-foreground mb-6">Intenta ajustar los filtros o buscar con otros términos</p>
                <Button
                  onClick={() => {
                    setSelectedType("all")
                    setSelectedBrand("all")
                    setPriceRange([0, maxPrice])
                    setSearchTerm("")
                    setSortBy("featured")
                    router.push("/products")
                  }}
                >
                  Restablecer filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={`${product.tipo}-${product.id}`} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      <Image
                        src={product.imagen_url || "/placeholder.svg?height=192&width=256"}
                        alt={product.nombre}
                        fill
                        className="object-contain p-4"
                      />
                      <div className="absolute top-2 left-2">
                        <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md flex items-center">
                          {getProductIcon(product.tipo)}
                          <span className="ml-1">{getProductTypeName(product.tipo)}</span>
                        </div>
                      </div>
                    </div>                    <CardContent className="p-4">
                      <div className="mb-1 text-xs text-muted-foreground">{product.marca}</div>
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
        </div>
      </div>
    </div>
  )
}
