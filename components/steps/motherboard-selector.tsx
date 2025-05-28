"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface MotherboardSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function MotherboardSelector({ build, updateBuild }: MotherboardSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMotherboards, setFilteredMotherboards] = useState(mockData.placa_madre)

  // Filter motherboards based on CPU socket and search term
  useEffect(() => {
    if (!build.cpu) return

    const filtered = mockData.placa_madre.filter((motherboard) => {
      // Filter by CPU socket compatibility
      const isSocketCompatible = motherboard.socket === build.cpu?.socket

      // Filter by search term
      const matchesSearch = motherboard.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return isSocketCompatible && matchesSearch
    })

    setFilteredMotherboards(filtered)
  }, [build.cpu, searchTerm])

  const handleSelectMotherboard = (motherboard: any) => {
    // When changing motherboard, we need to reset RAM if it's incompatible
    const updatedBuild = { ...build, motherboard }

    // Check if current RAM is compatible with new motherboard
    if (build.ram && build.ram.tipo_memoria !== motherboard.tipo_memoria) {
      updatedBuild.ram = null
    }

    updateBuild(updatedBuild)
  }

  if (!build.cpu) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Selecciona un CPU primero</h3>
        <p className="text-muted-foreground">Debes seleccionar un procesador antes de elegir una placa madre</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Placa Madre</h2>
        <p className="text-muted-foreground mb-6">Elige una placa madre compatible con tu CPU {build.cpu.nombre}</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="search-motherboard">Buscar</Label>
        <Input
          id="search-motherboard"
          placeholder="Buscar placa madre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMotherboards.map((motherboard) => (
          <Card
            key={motherboard.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.motherboard?.id === motherboard.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectMotherboard(motherboard)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={motherboard.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={motherboard.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{motherboard.nombre}</h3>
                  <p className="text-sm text-muted-foreground">Socket: {motherboard.socket}</p>
                </div>
                {build.motherboard?.id === motherboard.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-muted-foreground">
                  <span>
                    {motherboard.formato} • {motherboard.tipo_memoria}
                  </span>
                </div>
                <span className="font-semibold">${motherboard.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMotherboards.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron placas madre compatibles con tu CPU</p>
          </div>
        )}
      </div>
    </div>
  )
}
