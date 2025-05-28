"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Edit, Trash2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiService, type Product } from "@/lib/api-service"

export default function AdminProductsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "No tienes permisos para acceder a esta página.",
        })
        router.push("/")
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, session, router, toast])

  // Inicializar datos de prueba
  useEffect(() => {
    apiService.init()
  }, [])

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      if (status !== "authenticated" || session?.user?.role !== "admin") return

      try {
        setIsLoading(true)
        const data = await apiService.getProducts()
        setProducts(data)
        setFilteredProducts(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar productos",
          description: "No se pudieron cargar los productos. Inténtalo de nuevo más tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [status, session, toast])

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = [...products]

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter((product) => product.tipo === selectedType)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toString().includes(searchTerm),
      )
    }

    // Ordenar productos
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
      case "name-desc":
        filtered.sort((a, b) => b.nombre.localeCompare(a.nombre))
        break
      case "price-asc":
        filtered.sort((a, b) => a.precio - b.precio)
        break
      case "price-desc":
        filtered.sort((a, b) => b.precio - a.precio)
        break
      case "stock-asc":
        filtered.sort((a, b) => a.stock - b.stock)
        break
      case "stock-desc":
        filtered.sort((a, b) => b.stock - a.stock)
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedType, searchTerm, sortBy])

  // Función para manejar la eliminación de un producto
  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      await apiService.deleteProduct(productToDelete.tipo, productToDelete.id)
      setProducts(products.filter((p) => !(p.tipo === productToDelete.tipo && p.id === productToDelete.id)))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar producto",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo más tarde.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  // Función para obtener el nombre del tipo de producto en español
  const getProductTypeName = (type: string) => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Gestión de Productos</h1>
        <Button asChild>
          <a href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </a>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros y búsqueda</CardTitle>
          <CardDescription>Filtra y busca productos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, marca o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="cpu">Procesadores</SelectItem>
                  <SelectItem value="gpu">Tarjetas Gráficas</SelectItem>
                  <SelectItem value="ram">Memoria RAM</SelectItem>
                  <SelectItem value="motherboard">Placas Madre</SelectItem>
                  <SelectItem value="storage">Almacenamiento</SelectItem>
                  <SelectItem value="psu">Fuentes de Poder</SelectItem>
                  <SelectItem value="case">Gabinetes</SelectItem>
                  <SelectItem value="peripheral">Periféricos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Precio (menor a mayor)</SelectItem>
                  <SelectItem value="price-desc">Precio (mayor a menor)</SelectItem>
                  <SelectItem value="stock-asc">Stock (menor a mayor)</SelectItem>
                  <SelectItem value="stock-desc">Stock (mayor a menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {filteredProducts.length} {filteredProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="min-w-[150px]">Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={`${product.tipo}-${product.id}`}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 relative flex-shrink-0">
                            <Image
                              src={product.imagen_url || "/placeholder.svg?height=40&width=40"}
                              alt={product.nombre}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="font-medium">{product.nombre}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProductTypeName(product.tipo)}</Badge>
                      </TableCell>
                      <TableCell>{product.marca}</TableCell>
                      <TableCell className="text-right">${product.precio.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={product.stock > 10 ? "outline" : product.stock > 0 ? "secondary" : "destructive"}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" asChild>
                            <a href={`/admin/products/edit/${product.tipo}/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setProductToDelete(product)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmación para eliminar producto */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
