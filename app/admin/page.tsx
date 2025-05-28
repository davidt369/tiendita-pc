"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"; // Added import
import { Users, Package, DollarSign, TrendingUp, TrendingDown, ShoppingCart, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api-service"

// Importar componentes de gráficos
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Registrar componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

type SessionUserWithRole = {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

type SessionWithRole = {
  user?: SessionUserWithRole
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: sessionData, status } = useSession()
  const session = sessionData as SessionWithRole
  const { toast } = useToast()
  const { resolvedTheme } = useTheme(); // Get resolved theme
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    salesByMonth: [] as { month: string; sales: number }[],
    ordersByStatus: {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    topProducts: [] as { name: string; sales: number }[],
  })

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

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status !== "authenticated" || session?.user?.role !== "admin") return

      try {
        setIsLoading(true)
        // Simulate API delay for skeleton/loader
        // await new Promise(resolve => setTimeout(resolve, 1500));
        const data = await apiService.getDashboardStats()
        setDashboardData(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos del dashboard. Inténtalo de nuevo más tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [status, session, toast])

  // Define theme-aware colors for chart text and grid lines
  const tickAndLegendColor = resolvedTheme === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))'; // Should adapt
  const gridLineColor = resolvedTheme === 'dark' ? 'hsl(var(--border))' : 'hsl(var(--border))'; // Should adapt

  // Lilac color palette
  const primaryLilac = "hsl(270, 70%, 75%)"; // Main lilac
  const lightLilac = "hsl(270, 70%, 85%)";
  const darkLilac = "hsl(270, 60%, 65%)";
  const complementaryLilac1 = "hsl(280, 70%, 80%)";
  const complementaryLilac2 = "hsl(260, 70%, 80%)";


  // Datos para el gráfico de ventas mensuales
  const salesChartData = {
    labels: dashboardData.salesByMonth.map((item) => item.month),
    datasets: [
      {
        label: "Ventas mensuales",
        data: dashboardData.salesByMonth.map((item) => item.sales),
        borderColor: primaryLilac, // Use primaryLilac
        backgroundColor: "hsla(270, 70%, 75%, 0.1)", // Use primaryLilac with alpha
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // Datos para el gráfico de estado de pedidos
  const orderStatusChartData = {
    labels: ["En procesamiento", "Enviados", "Entregados", "Cancelados"],
    datasets: [
      {
        data: [
          dashboardData.ordersByStatus.processing,
          dashboardData.ordersByStatus.shipped,
          dashboardData.ordersByStatus.delivered,
          dashboardData.ordersByStatus.cancelled,
        ],
        backgroundColor: [
          primaryLilac,
          darkLilac,
          lightLilac,
          complementaryLilac1,
        ], // Lilac palette for pie chart
        borderWidth: 1,
        borderColor: resolvedTheme === 'dark' ? 'hsl(var(--background))' : 'hsl(var(--card))', // Border for segments
      },
    ],
  }

  // Datos para el gráfico de productos más vendidos
  const topProductsChartData = {
    labels: dashboardData.topProducts.map((item) => item.name),
    datasets: [
      {
        label: "Unidades vendidas",
        data: dashboardData.topProducts.map((item) => item.sales),
        backgroundColor: primaryLilac, // Use primaryLilac
        borderColor: darkLilac, // Optional: border for bars
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando datos del dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ventas totales</p>
                <h3 className="text-2xl font-bold">${dashboardData.totalSales.toLocaleString()}</h3>
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% vs mes anterior
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pedidos totales</p>
                <h3 className="text-2xl font-bold">{dashboardData.totalOrders}</h3>
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2% vs mes anterior
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Usuarios registrados</p>
                <h3 className="text-2xl font-bold">{dashboardData.totalUsers}</h3>
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5.3% vs mes anterior
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valor promedio</p>
                <h3 className="text-2xl font-bold">${dashboardData.averageOrderValue.toFixed(2)}</h3>
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -2.1% vs mes anterior
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Ventas mensuales</CardTitle>
            <CardDescription>Ingresos por ventas durante los últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: gridLineColor, // Use theme-aware grid color
                      },
                      ticks: {
                        color: tickAndLegendColor, // Use theme-aware tick color
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: tickAndLegendColor, // Use theme-aware tick color
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                       labels: {
                        color: tickAndLegendColor, // Set legend label color
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Estado de pedidos</CardTitle>
            <CardDescription>Distribución de pedidos por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="h-64 w-64">
                <Pie
                  data={orderStatusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: tickAndLegendColor, // Use theme-aware legend label color
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Productos más vendidos</CardTitle>
          <CardDescription>Los 5 productos con mayor número de ventas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar
              data={topProductsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x', // Can be 'y' for horizontal bars
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: tickAndLegendColor, // Use theme-aware tick color
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: gridLineColor, // Use theme-aware grid color
                    },
                    ticks: {
                      color: tickAndLegendColor, // Use theme-aware tick color
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: true, // Or false if only one dataset
                    labels: {
                      color: tickAndLegendColor, // Use theme-aware legend label color
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
