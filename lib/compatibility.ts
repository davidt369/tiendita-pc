import type { PCBuild } from "./types"

export function validateCompatibility(build: PCBuild): string[] {
  const issues: string[] = []

  // Skip validation if essential components are missing
  if (!build.cpu || !build.motherboard) {
    return issues
  }

  // Check CPU and motherboard socket compatibility
  if (build.cpu && build.motherboard && build.cpu.socket !== build.motherboard.socket) {
    issues.push(
      `El socket del CPU (${build.cpu.socket}) no es compatible con la placa madre (${build.motherboard.socket}).`,
    )
  }

  // Check RAM and motherboard compatibility
  if (build.ram && build.motherboard && build.ram.tipo_memoria !== build.motherboard.tipo_memoria) {
    issues.push(
      `El tipo de memoria RAM (${build.ram.tipo_memoria}) no es compatible con la placa madre (${build.motherboard.tipo_memoria}).`,
    )
  }

  // Check case and motherboard form factor compatibility
  if (build.case && build.motherboard) {
    const caseSupportsMotherboard =
      build.case.formato_compatible === build.motherboard.formato ||
      (build.case.formato_compatible === "ATX" && ["Micro-ATX", "Mini-ITX"].includes(build.motherboard.formato)) ||
      (build.case.formato_compatible === "Micro-ATX" && build.motherboard.formato === "Mini-ITX")

    if (!caseSupportsMotherboard) {
      issues.push(
        `El formato del gabinete (${build.case.formato_compatible}) no es compatible con la placa madre (${build.motherboard.formato}).`,
      )
    }
  }

  // Check GPU size compatibility with case
  if (build.gpu && build.case) {
    const gpuSize = Number.parseInt(build.gpu.tamano_gpu)
    if (gpuSize > build.case.max_gpu_mm) {
      issues.push(
        `La GPU es demasiado grande (${build.gpu.tamano_gpu}) para el gabinete (máximo ${build.case.max_gpu_mm}mm).`,
      )
    }
  }

  // Check power supply wattage is sufficient
  if (build.psu && build.cpu && build.gpu) {
    // Estimate power consumption (simplified)
    const cpuWatts = 65 // Default estimate
    const gpuWatts = build.gpu.watts || 0
    const otherComponentsWatts = 100 // Estimate for other components

    const totalWatts = cpuWatts + gpuWatts + otherComponentsWatts
    const recommendedWatts = totalWatts * 1.2 // 20% headroom

    if (build.psu.watts < recommendedWatts) {
      issues.push(
        `La fuente de poder (${build.psu.watts}W) puede ser insuficiente para los componentes seleccionados (recomendado: ${Math.ceil(recommendedWatts)}W).`,
      )
    }
  }

  return issues
}
