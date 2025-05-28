"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Shield, Trash2, Loader2, X } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { apiService, type User } from "@/lib/api-service"

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<"admin" | "user">("user")

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

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      if (status !== "authenticated" || session?.user?.role !== "admin") return

      try {
        setIsLoading(true)
        const data = await apiService.getUsers()
        setUsers(data)
        setFilteredUsers(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar usuarios",
          description: "No se pudieron cargar los usuarios. Inténtalo de nuevo más tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [status, session, toast])

  // Filtrar y ordenar usuarios
  useEffect(() => {
    let filtered = [...users]

    // Filtrar por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toString().includes(searchTerm),
      )
    }

    // Ordenar usuarios
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "email-asc":
        filtered.sort((a, b) => a.email.localeCompare(b.email))
        break
      case "email-desc":
        filtered.sort((a, b) => b.email.localeCompare(a.email))
        break
      case "date-asc":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "date-desc":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setFilteredUsers(filtered)
  }, [users, roleFilter, searchTerm, sortBy])

  // Función para manejar la eliminación de un usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await apiService.deleteUser(userToDelete.id)
      setUsers(users.filter((u) => u.id !== userToDelete.id))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar usuario",
        description: "No se pudo eliminar el usuario. Inténtalo de nuevo más tarde.",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  // Función para manejar el cambio de rol de un usuario
  const handleChangeRole = async () => {
    if (!userToChangeRole || !newRole) return

    try {
      const updatedUser = { ...userToChangeRole, role: newRole }
      await apiService.updateUser(updatedUser)
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
      toast({
        title: "Rol actualizado",
        description: `El usuario ahora tiene el rol de ${newRole === "admin" ? "administrador" : "usuario"}.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cambiar rol",
        description: "No se pudo cambiar el rol del usuario. Inténtalo de nuevo más tarde.",
      })
    } finally {
      setRoleDialogOpen(false)
      setUserToChangeRole(null)
    }
  }

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros y búsqueda</CardTitle>
          <CardDescription>Filtra y busca usuarios por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="user">Usuarios</SelectItem>
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
                  <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                  <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                  <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                  <SelectItem value="date-asc">Fecha (más antiguo)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? "usuario encontrado" : "usuarios encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Administrador" : "Usuario"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUserToChangeRole(user)
                              setNewRole(user.role === "admin" ? "user" : "admin")
                              setRoleDialogOpen(true)
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Cambiar rol
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              setUserToDelete(user)
                              setDeleteDialogOpen(true)
                            }}
                            disabled={user.id === session?.user?.id} // No permitir eliminar al usuario actual
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario "{userToDelete?.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cambiar rol de usuario */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol de usuario</DialogTitle>
            <DialogDescription>
              Estás cambiando el rol de "{userToChangeRole?.name}" de{" "}
              {userToChangeRole?.role === "admin" ? "administrador" : "usuario"} a{" "}
              {newRole === "admin" ? "administrador" : "usuario"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "user")}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeRole}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
