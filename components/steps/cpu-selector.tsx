"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface CPUSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function CPUSelector({ build, updateBuild }: CPUSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCPUs, setFilteredCPUs] = useState(mockData.cpu)

  // Filter CPUs based on platform and search term
  useEffect(() => {
    if (!build.platform) return

    const filtered = mockData.cpu.filter((cpu) => {
      // Filter by platform (socket naming convention)
      const isCorrectPlatform =
        build.platform === "intel" ? cpu.socket.toLowerCase().includes("lga") : cpu.socket.toLowerCase().includes("am")

      // Filter by search term
      const matchesSearch = cpu.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return isCorrectPlatform && matchesSearch
    })

    setFilteredCPUs(filtered)
  }, [build.platform, searchTerm])

  const handleSelectCPU = (cpu: any) => {
    // When changing CPU, we need to reset motherboard if it's incompatible
    const updatedBuild = { ...build, cpu }

    // Check if current motherboard is compatible with new CPU
    if (build.motherboard && build.motherboard.socket !== cpu.socket) {
      updatedBuild.motherboard = null
    }

    updateBuild(updatedBuild)
  }

  if (!build.platform) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Selecciona una plataforma primero</h3>
        <p className="text-muted-foreground">Debes seleccionar Intel o AMD antes de elegir un procesador</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu CPU</h2>
        <p className="text-muted-foreground mb-6">
          Elige un procesador {build.platform === "intel" ? "Intel" : "AMD"} para tu PC
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="search-cpu">Buscar</Label>
        <Input
          id="search-cpu"
          placeholder="Buscar procesador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCPUs.map((cpu) => (
          <Card
            key={cpu.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.cpu?.id === cpu.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectCPU(cpu)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={cpu.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={cpu.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{cpu.nombre}</h3>
                  <p className="text-sm text-muted-foreground">Socket: {cpu.socket}</p>
                </div>
                {build.cpu?.id === cpu.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {cpu.compatible_con ? Object.keys(cpu.compatible_con).join(", ") : ""}
                </span>
                <span className="font-semibold">${cpu.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCPUs.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron CPUs que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
