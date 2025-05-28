"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle, Plus, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface RAMSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function RAMSelector({ build, updateBuild }: RAMSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRAMs, setFilteredRAMs] = useState(mockData.ram)
  const [quantity, setQuantity] = useState(1)

  // Filter RAMs based on motherboard memory type and search term
  useEffect(() => {
    if (!build.motherboard) return

    const filtered = mockData.ram.filter((ram) => {
      // Filter by memory type compatibility
      const isTypeCompatible = ram.tipo_memoria === build.motherboard?.tipo_memoria

      // Filter by search term
      const matchesSearch = ram.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return isTypeCompatible && matchesSearch
    })

    setFilteredRAMs(filtered)
  }, [build.motherboard, searchTerm])

  const handleSelectRAM = (ram: any) => {
    updateBuild({ ...build, ram: { ...ram, quantity } })
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 4))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  if (!build.motherboard) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Selecciona una placa madre primero</h3>
        <p className="text-muted-foreground">Debes seleccionar una placa madre antes de elegir memoria RAM</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Memoria RAM</h2>
        <p className="text-muted-foreground mb-6">
          Elige memoria RAM compatible con tu placa madre ({build.motherboard.tipo_memoria})
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search-ram">Buscar</Label>
          <Input
            id="search-ram"
            placeholder="Buscar memoria RAM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Cantidad</Label>
          <div className="flex items-center mt-1">
            <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-4 font-medium">{quantity}</span>
            <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= 4}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRAMs.map((ram) => (
          <Card
            key={ram.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.ram?.id === ram.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectRAM(ram)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={ram.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={ram.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{ram.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {ram.tipo_memoria} • {ram.capacidad_gb}GB
                  </p>
                </div>
                {build.ram?.id === ram.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {quantity > 1
                    ? `${quantity} x ${ram.capacidad_gb}GB = ${quantity * ram.capacidad_gb}GB`
                    : `${ram.capacidad_gb}GB`}
                </span>
                <span className="font-semibold">${(ram.precio * quantity).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRAMs.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron memorias RAM compatibles con tu placa madre</p>
          </div>
        )}
      </div>
    </div>
  )
}
