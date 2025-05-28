"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, Loader2, Star, Plus, Minus, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/stores/cart-store"
import { mockData } from "@/lib/mock-data"

export default function ProductDetailPage() {
  const router = useRouter()
  const { type, id } = useParams()
  const { toast } = useToast()
  const addToCart = useCartStore((state) => state.addItem)

  const [product, setProduct] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])

  // Cargar detalles del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true)
        // En un entorno real, esto sería una llamada a la API
        // const response = await api.get(`/api/products/${type}/${id}`)
        // setProduct(response.data)

        // Simular un retraso para mostrar el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Obtener el producto del mock data según el tipo
        let productData = null
        const productId = Number(id)

        switch (type) {
          case "cpu":
            productData = mockData.cpu.find((item) => item.id === productId)
            break
          case "gpu":
            productData = mockData.gpu.find((item) => item.id === productId)
            break
          case "ram":
            productData = mockData.ram.find((item) => item.id === productId)
            break
          case "motherboard":
            productData = mockData.placa_madre.find((item) => item.id === productId)
            break
          case "storage":
            productData = mockData.almacenamiento.find((item) => item.id === productId)
            break
          case "psu":
            productData = mockData.fuente.find((item) => item.id === productId)
            break
          case "case":
            productData = mockData.gabinete.find((item) => item.id === productId)
            break
          case "peripheral":
            productData = mockData.perifericos.find((item) => item.id === productId)
            break
        }

        if (!productData) {
          // Si no se encuentra el producto, redirigir a la página de productos
          toast({
            variant: "destructive",
            title: "Producto no encontrado",
            description: "El producto que buscas no existe.",
          })
          router.push("/products")
          return
        }

        // Añadir datos adicionales para la demostración
        const enhancedProduct = {
          ...productData,
          tipo: type,
          marca: ["Intel", "AMD", "NVIDIA", "Corsair", "ASUS", "MSI", "Kingston", "Samsung"][
            Math.floor(Math.random() * 8)
          ],
          descripcion:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.",
          especificaciones: {
            Modelo: productData.nombre,
            Marca: ["Intel", "AMD", "NVIDIA", "Corsair", "ASUS", "MSI", "Kingston", "Samsung"][
              Math.floor(Math.random() * 8)
            ],
            Garantía: "12 meses",
            ...(type === "cpu" && {
              Socket: productData.socket,
              Núcleos: Math.floor(Math.random() * 16) + 4,
              Hilos: Math.floor(Math.random() * 32) + 8,
              "Frecuencia base": `${(Math.random() * 2 + 2).toFixed(1)} GHz`,
              "Frecuencia turbo": `${(Math.random() * 2 + 4).toFixed(1)} GHz`,
              TDP: `${Math.floor(Math.random() * 50) + 65}W`,
            }),
            ...(type === "gpu" && {
              Memoria: `${Math.floor(Math.random() * 8) + 8}GB GDDR6`,
              "Bus de memoria": `${Math.floor(Math.random() * 128) + 128}-bit`,
              Frecuencia: `${Math.floor(Math.random() * 500) + 1500} MHz`,
              "CUDA Cores": Math.floor(Math.random() * 4000) + 4000,
              Consumo: `${productData.watts}W`,
            }),
            ...(type === "ram" && {
              Tipo: productData.tipo_memoria,
              Capacidad: `${productData.capacidad_gb}GB`,
              Velocidad: `${Math.floor(Math.random() * 1600) + 3200} MHz`,
              "CAS Latency": `CL${Math.floor(Math.random() * 10) + 14}`,
              Voltaje: `${(Math.random() * 0.6 + 1.2).toFixed(2)}V`,
            }),
          },
          valoracion: (Math.random() * 2 + 3).toFixed(1),
          opiniones: Math.floor(Math.random() * 100) + 10,
          stock: Math.floor(Math.random() * 50) + 1,
        }

        setProduct(enhancedProduct)

        // Obtener productos relacionados
        let relatedData: any[] = []
        switch (type) {
          case "cpu":
            relatedData = mockData.cpu.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "gpu":
            relatedData = mockData.gpu.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "ram":
            relatedData = mockData.ram.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "motherboard":
            relatedData = mockData.placa_madre.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "storage":
            relatedData = mockData.almacenamiento.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "psu":
            relatedData = mockData.fuente.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "case":
            relatedData = mockData.gabinete.filter((item) => item.id !== productId).slice(0, 4)
            break
          case "peripheral":
            relatedData = mockData.perifericos.filter((item) => item.id !== productId).slice(0, 4)
            break
        }

        // Añadir tipo a los productos relacionados
        const enhancedRelated = relatedData.map((item) => ({
          ...item,
          tipo: type,
        }))

        setRelatedProducts(enhancedRelated)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar el producto",
          description: "No se pudo cargar la información del producto. Inténtalo de nuevo más tarde.",
        })
        router.push("/products")
      } finally {
        setIsLoading(false)
      }
    }

    if (type && id) {
      fetchProductDetails()
    }
  }, [type, id, router, toast])

  // Función para manejar la adición al carrito
  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      type: product.tipo,
      name: product.nombre,
      price: product.precio,
      quantity,
      image: product.imagen_url,
    })

    toast({
      title: "Producto añadido al carrito",
      description: `${product.nombre} ha sido añadido a tu carrito.`,
    })
  }

  // Función para obtener el nombre del tipo de producto en español
  const getProductTypeName = (productType: string) => {
    switch (productType) {
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
        return productType
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando detalles del producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
        </Button>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
          <p className="text-muted-foreground mb-6">El producto que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/products">Ver todos los productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Imagen del producto */}
        <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
          <div className="relative h-80 w-full">
            <Image
              src={product.imagen_url || "/placeholder.svg?height=320&width=320"}
              alt={product.nombre}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Detalles del producto */}
        <div>
          <div className="mb-2">
            <Badge variant="outline" className="mb-2">
              {getProductTypeName(product.tipo)}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.nombre}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center mr-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(Number(product.valoracion))
                        ? "text-yellow-500 fill-yellow-500"
                        : i < Number(product.valoracion)
                          ? "text-yellow-500 fill-yellow-500 opacity-50"
                          : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {product.valoracion} ({product.opiniones} opiniones)
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Marca: {product.marca}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-bold mb-2">${product.precio.toFixed(2)}</div>
            <div className="flex items-center text-sm">
              <Badge
                variant="outline"
                className={product.stock > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}
              >
                {product.stock > 0 ? "En stock" : "Agotado"}
              </Badge>
              {product.stock > 0 && (
                <span className="ml-2 text-muted-foreground">
                  {product.stock} {product.stock === 1 ? "unidad disponible" : "unidades disponibles"}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">{product.descripcion}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={product.stock <= 0 || quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1" size="lg" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Añadir al carrito
              </Button>
              <Button variant="secondary" className="flex-1" size="lg" asChild>
                <Link href="/wizard">Armar PC completa</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Envío gratis en pedidos superiores a $999</span>
            </div>
            <div className="flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Garantía de {product.especificaciones.Garantía}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de información */}
      <Tabs defaultValue="specs" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Especificaciones</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibilidad</TabsTrigger>
          <TabsTrigger value="reviews">Opiniones</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="p-6 border rounded-md mt-6">
          <h3 className="text-lg font-medium mb-4">Especificaciones técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.especificaciones).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b">
                <span className="font-medium">{key}</span>
                <span className="text-muted-foreground">{value as string}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="compatibility" className="p-6 border rounded-md mt-6">
          <h3 className="text-lg font-medium mb-4">Información de compatibilidad</h3>
          <div className="space-y-4">
            {product.tipo === "cpu" && (
              <>
                <p>Este procesador es compatible con las siguientes placas madre:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Placas madre con socket {product.socket}</li>
                  {Object.keys(product.compatible_con || {}).map((chipset) => (
                    <li key={chipset}>Chipset {chipset}</li>
                  ))}
                </ul>
              </>
            )}
            {product.tipo === "motherboard" && (
              <>
                <p>Esta placa madre es compatible con:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Procesadores con socket {product.socket}</li>
                  <li>Memoria {product.tipo_memoria}</li>
                  <li>Formato {product.formato}</li>
                </ul>
              </>
            )}
            {product.tipo === "ram" && (
              <>
                <p>Esta memoria RAM es compatible con:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Placas madre que soporten {product.tipo_memoria}</li>
                  <li>Capacidad: {product.capacidad_gb}GB</li>
                </ul>
              </>
            )}
            {product.tipo === "gpu" && (
              <>
                <p>Esta tarjeta gráfica requiere:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Slot PCIe x16</li>
                  <li>Fuente de poder de al menos {product.watts + 150}W</li>
                  <li>Espacio en gabinete de al menos {product.tamano_gpu}mm</li>
                </ul>
              </>
            )}
            {product.tipo === "case" && (
              <>
                <p>Este gabinete es compatible con:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Placas madre formato {product.formato_compatible}</li>
                  <li>Tarjetas gráficas de hasta {product.max_gpu_mm}mm de longitud</li>
                </ul>
              </>
            )}
            {product.tipo === "psu" && (
              <>
                <p>Esta fuente de poder ofrece:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Potencia de {product.watts}W</li>
                  <li>Eficiencia {product.eficiencia}</li>
                  <li>Suficiente para sistemas con un consumo de hasta {Math.floor(product.watts * 0.8)}W</li>
                </ul>
              </>
            )}
            {product.tipo === "storage" && (
              <>
                <p>Este dispositivo de almacenamiento:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Tipo: {product.tipo}</li>
                  <li>Capacidad: {product.capacidad_gb}GB</li>
                </ul>
              </>
            )}
            <div className="mt-6">
              <Button asChild>
                <Link href="/wizard">Usar en el armado de PC</Link>
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="p-6 border rounded-md mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Opiniones de clientes</h3>
            <div className="flex items-center">
              <div className="flex items-center mr-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(Number(product.valoracion))
                        ? "text-yellow-500 fill-yellow-500"
                        : i < Number(product.valoracion)
                          ? "text-yellow-500 fill-yellow-500 opacity-50"
                          : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.valoracion}</span>
              <span className="text-muted-foreground ml-1">({product.opiniones} opiniones)</span>
            </div>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${
                          j < 4 + (i % 2) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{["Excelente producto", "Muy buena compra", "Recomendado"][i]}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Por {["Juan Pérez", "María García", "Carlos Rodríguez"][i]} -{" "}
                  {["15/03/2023", "22/04/2023", "10/05/2023"][i]}
                </p>
                <p>
                  {
                    [
                      "Excelente producto, cumple con todas mis expectativas. La calidad es muy buena y el rendimiento es excepcional.",
                      "Muy buena relación calidad-precio. El producto llegó en perfectas condiciones y funciona de maravilla.",
                      "Recomiendo este producto, es justo lo que necesitaba para mi PC. La instalación fue sencilla y el rendimiento es muy bueno.",
                    ][i]
                  }
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={`${relatedProduct.tipo}-${relatedProduct.id}`} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <Image
                    src={relatedProduct.imagen_url || "/placeholder.svg?height=192&width=256"}
                    alt={relatedProduct.nombre}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-2 mb-1 h-12">{relatedProduct.nombre}</h3>
                  <div className="text-lg font-bold">${relatedProduct.precio.toFixed(2)}</div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/products/${relatedProduct.tipo}/${relatedProduct.id}`}>Ver detalles</Link>
                  </Button>
                  <Button
                    onClick={() =>
                      addToCart({
                        id: relatedProduct.id,
                        type: relatedProduct.tipo,
                        name: relatedProduct.nombre,
                        price: relatedProduct.precio,
                        quantity: 1,
                        image: relatedProduct.imagen_url,
                      })
                    }
                  >
                    Añadir
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
