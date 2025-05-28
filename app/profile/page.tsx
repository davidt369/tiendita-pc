"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, Mail, Calendar, Shield, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información del usuario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
              <CardDescription>Detalles de tu cuenta de PC Builder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className="text-lg">{getUserInitials(session.user?.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{session.user?.name}</h2>
                  <p className="text-muted-foreground">{session.user?.email}</p>
                  <div className="flex items-center mt-2">
                    <Badge variant={session.user?.role === "admin" ? "default" : "secondary"}>
                      <Shield className="mr-1 h-3 w-3" />
                      {session.user?.role === "admin" ? "Administrador" : "Usuario"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    Nombre completo
                  </div>
                  <p className="font-medium">{session.user?.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    Correo electrónico
                  </div>
                  <p className="font-medium">{session.user?.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Miembro desde
                  </div>
                  <p className="font-medium">
                    {/* Simular fecha de registro */}
                    {formatDate(new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString())}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Tipo de cuenta
                  </div>
                  <p className="font-medium">{session.user?.role === "admin" ? "Administrador" : "Usuario estándar"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas y acciones */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Configuraciones guardadas</span>
                <span className="font-medium">
                  {typeof window !== "undefined" ? JSON.parse(localStorage.getItem("savedBuilds") || "[]").length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pedidos realizados</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total gastado</span>
                <span className="font-medium">$2,699.97</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <a href="/wizard">Armar nueva PC</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/orders">Ver mis pedidos</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/products">Explorar productos</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuenta de Google</CardTitle>
              <CardDescription>Tu cuenta está vinculada con Google</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm">Conectado con Google</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
