import type { PCBuild } from "./types"

export function calculateTotalPrice(build: PCBuild): number {
  let total = 0

  // Add CPU price
  if (build.cpu) {
    total += build.cpu.precio
  }

  // Add motherboard price
  if (build.motherboard) {
    total += build.motherboard.precio
  }

  // Add RAM price (considering quantity)
  if (build.ram) {
    total += build.ram.precio * (build.ram.quantity || 1)
  }

  // Add GPU price
  if (build.gpu) {
    total += build.gpu.precio
  }

  // Add storage price (single or multiple)
  if (build.storage) {
    if (Array.isArray(build.storage)) {
      total += build.storage.reduce((sum, item) => sum + item.precio, 0)
    } else {
      total += build.storage.precio
    }
  }

  // Add PSU price
  if (build.psu) {
    total += build.psu.precio
  }

  // Add case price
  if (build.case) {
    total += build.case.precio
  }

  // Add peripherals prices
  if (build.peripherals && build.peripherals.length > 0) {
    total += build.peripherals.reduce((sum, item) => sum + item.precio, 0)
  }

  return total
}

export function calculateTotalWattage(build: PCBuild): number {
  let totalWatts = 0

  // Base system consumption (motherboard, fans, etc.)
  const baseWatts = 50
  totalWatts += baseWatts

  // CPU consumption (estimated)
  if (build.cpu) {
    // Simplified estimate based on platform
    const cpuWatts = build.platform === "intel" ? 95 : 65
    totalWatts += cpuWatts
  }

  // GPU consumption
  if (build.gpu) {
    totalWatts += build.gpu.watts || 0
  }

  // RAM consumption (estimated)
  if (build.ram) {
    const ramWatts = 5 * (build.ram.quantity || 1)
    totalWatts += ramWatts
  }

  // Storage consumption (estimated)
  if (build.storage) {
    if (Array.isArray(build.storage)) {
      // Estimate based on type: HDD = 10W, SSD = 5W, NVMe = 7W
      const storageWatts = build.storage.reduce((sum, item) => {
        if (item.tipo === "HDD") return sum + 10
        if (item.tipo === "SSD") return sum + 5
        if (item.tipo === "NVMe") return sum + 7
        return sum + 5 // Default
      }, 0)
      totalWatts += storageWatts
    } else {
      // Single storage device
      if (build.storage.tipo === "HDD") totalWatts += 10
      else if (build.storage.tipo === "SSD") totalWatts += 5
      else if (build.storage.tipo === "NVMe") totalWatts += 7
      else totalWatts += 5 // Default
    }
  }

  return totalWatts
}
