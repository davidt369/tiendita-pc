"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { PCBuild } from "@/lib/types"

interface PlatformSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function PlatformSelector({ build, updateBuild }: PlatformSelectorProps) {
  const handleSelectPlatform = (platform: string) => {
    // When changing platform, we need to reset CPU and motherboard selections
    updateBuild({
      ...build,
      platform,
      cpu: null,
      motherboard: null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu plataforma</h2>
        <p className="text-muted-foreground mb-6">Elige entre Intel o AMD para comenzar a armar tu PC</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            build.platform === "intel" ? "border-2 border-primary" : ""
          }`}
          onClick={() => handleSelectPlatform("intel")}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src="https://images.seeklogo.com/logo-png/18/2/intel-logo-png_seeklogo-181977.png"
                alt="Intel"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold">Intel</h3>
            <p className="text-center text-muted-foreground mt-2">Procesadores Intel Core y Pentium</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            build.platform === "amd" ? "border-2 border-primary" : ""
          }`}
          onClick={() => handleSelectPlatform("amd")}
        >
          <CardContent className="p-6 flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src="https://rodrigolbarnes.com/wp-content/uploads/AMD-Logo.png"
                alt="AMD"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold">AMD</h3>
            <p className="text-center text-muted-foreground mt-2">Procesadores AMD Ryzen</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
