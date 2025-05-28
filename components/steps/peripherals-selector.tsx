"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface PeripheralsSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function PeripheralsSelector({ build, updateBuild }: PeripheralsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [peripheralType, setPeripheralType] = useState<string>("all")
  const [filteredPeripherals, setFilteredPeripherals] = useState(mockData.perifericos)
  const [selectedPeripherals, setSelectedPeripherals] = useState<any[]>(build.peripherals || [])

  // Filter peripherals based on type and search term
  useEffect(() => {
    const filtered = mockData.perifericos.filter((peripheral) => {
      // Filter by type
      const matchesType = peripheralType === "all" || peripheral.tipo === peripheralType

      // Filter by search term
      const matchesSearch = peripheral.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesType && matchesSearch
    })

    setFilteredPeripherals(filtered)
  }, [peripheralType, searchTerm])

  const handleSelectPeripheral = (peripheral: any) => {
    // Add the peripheral to the selected list if not already selected
    if (!selectedPeripherals.some((item) => item.id === peripheral.id)) {
      const updatedPeripherals = [...selectedPeripherals, peripheral]
      setSelectedPeripherals(updatedPeripherals)
      updateBuild({ ...build, peripherals: updatedPeripherals })
    }
  }

  const handleRemovePeripheral = (peripheralId: number) => {
    const updatedPeripherals = selectedPeripherals.filter((item) => item.id !== peripheralId)
    setSelectedPeripherals(updatedPeripherals)
    updateBuild({ ...build, peripherals: updatedPeripherals })
  }

  if (!build.cpu || !build.motherboard || !build.ram || !build.psu || !build.case) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Completa los pasos anteriores primero</h3>
        <p className="text-muted-foreground">Debes seleccionar los componentes básicos antes de elegir periféricos</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tus Periféricos (Opcional)</h2>
        <p className="text-muted-foreground mb-6">Agrega periféricos opcionales a tu configuración</p>
      </div>

      {selectedPeripherals.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-3">Periféricos seleccionados</h3>
          <div className="space-y-2">
            {selectedPeripherals.map((peripheral) => (
              <div key={peripheral.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 relative mr-3">
                    <Image
                      src={peripheral.imagen_url || "/placeholder.svg?height=40&width=40"}
                      alt={peripheral.nombre}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{peripheral.nombre}</h4>
                    <p className="text-sm text-muted-foreground">
                      {peripheral.tipo} {peripheral.especificaciones ? `• ${peripheral.especificaciones}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-4">${peripheral.precio.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePeripheral(peripheral.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="search-peripheral">Buscar</Label>
          <Input
            id="search-peripheral"
            placeholder="Buscar periféricos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="peripheral-type">Tipo</Label>
          <Select value={peripheralType} onValueChange={setPeripheralType}>
            <SelectTrigger id="peripheral-type" className="mt-1">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="Monitor">Monitores</SelectItem>
              <SelectItem value="Teclado">Teclados</SelectItem>
              <SelectItem value="Mouse">Ratones</SelectItem>
              <SelectItem value="Otro">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeripherals.map((peripheral) => (
          <Card
            key={peripheral.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedPeripherals.some((item) => item.id === peripheral.id) ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectPeripheral(peripheral)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={peripheral.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={peripheral.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{peripheral.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{peripheral.tipo}</p>
                </div>
                {selectedPeripherals.some((item) => item.id === peripheral.id) && (
                  <Check className="ml-auto h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {peripheral.especificaciones || peripheral.tipo}
                </span>
                <span className="font-semibold">${peripheral.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPeripherals.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron periféricos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
