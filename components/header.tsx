"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ShoppingCart, Menu, X, User, LogOut, Package, Home, ChevronDown, Laptop, LayoutDashboard, Settings, Users, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./button-theme"

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

export function Header() {
  const { data: session } = useSession<{ user: SessionUser }>()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const cartItems = useCartStore((state) => state.items)

  const isAdmin = session?.user?.role === "admin"
  const cartItemCount = cartItems.length

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Armar PC", href: "/wizard" },
    { name: "Productos", href: "/products" },
  ]

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Productos", href: "/admin/products", icon: Package },
    { name: "Pedidos", href: "/admin/orders", icon: ListOrdered },
    { name: "Usuarios", href: "/admin/users", icon: Users },
    // Example for a settings page, if you add one
    // { name: "Configuración", href: "/admin/settings", icon: Settings },
  ]

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Laptop className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">PC Builder</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:ml-10 md:flex md:space-x-8 items-center"> {/* Added items-center for vertical alignment if needed */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center px-0 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      Admin
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {adminNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center">
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ModeToggle /> {/* Moved here */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>{getUserInitials(session.user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Mis pedidos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <Laptop className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">PC Builder</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                    <span className="sr-only">Cerrar menú</span>
                  </Button>
                </div>

                <nav className="mt-8 flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center py-2 text-base font-medium transition-colors hover:text-primary",
                        pathname === item.href ? "text-primary" : "text-muted-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name === "Inicio" && <Home className="mr-2 h-5 w-5" />}
                      {item.name === "Armar PC" && <Laptop className="mr-2 h-5 w-5" />}
                      {item.name === "Productos" && <Package className="mr-2 h-5 w-5" />}
                      {item.name}
                    </Link>
                  ))}

                  {isAdmin && (
                    <>
                      <div className="pt-2 pb-1">
                        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Administración
                        </p>
                      </div>
                      {adminNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center py-2 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="mr-2 h-5 w-5" />
                          {item.name}
                        </Link>
                      ))}
                    </>
                  )}
                </nav>

                <div className="mt-auto pt-6 pb-8">
                  {session ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                          <AvatarFallback>{getUserInitials(session.user?.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                        <Link href="/auth/login">Iniciar sesión</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                        <Link href="/auth/register">Registrarse</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
