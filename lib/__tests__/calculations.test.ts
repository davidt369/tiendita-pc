import { calculateTotalPrice, calculateTotalWattage } from '@/lib/calculations';
import type { PCBuild, Product } from '@/lib/types';

describe('calculateTotalPrice', () => {
  it('should return 0 for an empty build', () => {
    const build: PCBuild = {};
    expect(calculateTotalPrice(build)).toBe(0);
  });

  it('should calculate the total price of all components', () => {
    const build: PCBuild = {
      cpu: { id: '1', nombre: 'CPU', precio: 100, tipo: 'cpu' } as Product,
      motherboard: { id: '2', nombre: 'Motherboard', precio: 80, tipo: 'motherboard' } as Product,
      ram: { id: '3', nombre: 'RAM', precio: 50, quantity: 2, tipo: 'ram' } as Product & { quantity?: number },
      gpu: { id: '4', nombre: 'GPU', precio: 200, tipo: 'gpu' } as Product,
      storage: [
        { id: '5', nombre: 'SSD', precio: 70, tipo: 'SSD' } as Product,
        { id: '6', nombre: 'HDD', precio: 40, tipo: 'HDD' } as Product,
      ],
      psu: { id: '7', nombre: 'PSU', precio: 60, tipo: 'psu' } as Product,
      case: { id: '8', nombre: 'Case', precio: 50, tipo: 'case' } as Product,
      peripherals: [
        { id: '9', nombre: 'Keyboard', precio: 30, tipo: 'peripheral' } as Product,
        { id: '10', nombre: 'Mouse', precio: 20, tipo: 'peripheral' } as Product,
      ],
    };
    // 100 (cpu) + 80 (mb) + 50*2 (ram) + 200 (gpu) + 70 (ssd) + 40 (hdd) + 60 (psu) + 50 (case) + 30 (keyboard) + 20 (mouse) = 750
    expect(calculateTotalPrice(build)).toBe(750);
  });

  it('should handle missing components gracefully', () => {
    const build: PCBuild = {
      cpu: { id: '1', nombre: 'CPU', precio: 100, tipo: 'cpu' } as Product,
      ram: { id: '3', nombre: 'RAM', precio: 50, tipo: 'ram' } as Product, // No quantity, defaults to 1
    };
    // 100 (cpu) + 50 (ram) = 150
    expect(calculateTotalPrice(build)).toBe(150);
  });

  it('should handle single storage item', () => {
    const build: PCBuild = {
      storage: { id: '5', nombre: 'SSD', precio: 70, tipo: 'SSD' } as Product,
    };
    expect(calculateTotalPrice(build)).toBe(70);
  });
});

describe('calculateTotalWattage', () => {
  it('should return base wattage for an empty build', () => {
    const build: PCBuild = {};
    expect(calculateTotalWattage(build)).toBe(50); // Base watts
  });

  it('should calculate total wattage for a complete build (Intel)', () => {
    const build: PCBuild = {
      platform: 'intel',
      cpu: { id: '1', nombre: 'CPU Intel', precio: 100, tipo: 'cpu' } as Product,
      gpu: { id: '4', nombre: 'GPU', precio: 200, tipo: 'gpu', watts: 150 } as Product & { watts?: number },
      ram: { id: '3', nombre: 'RAM', precio: 50, quantity: 2, tipo: 'ram' } as Product & { quantity?: number },
      storage: [
        { id: '5', nombre: 'SSD', precio: 70, tipo: 'SSD' } as Product,
        { id: '6', nombre: 'NVMe', precio: 90, tipo: 'NVMe' } as Product,
        { id: '11', nombre: 'HDD', precio: 40, tipo: 'HDD' } as Product,
      ],
    };
    // Base (50) + CPU Intel (95) + GPU (150) + RAM (5*2=10) + SSD (5) + NVMe (7) + HDD (10) = 327
    expect(calculateTotalWattage(build)).toBe(327);
  });

  it('should calculate total wattage for a complete build (AMD)', () => {
    const build: PCBuild = {
      platform: 'amd',
      cpu: { id: '1', nombre: 'CPU AMD', precio: 100, tipo: 'cpu' } as Product,
      gpu: { id: '4', nombre: 'GPU', precio: 200, tipo: 'gpu', watts: 120 } as Product & { watts?: number },
      ram: { id: '3', nombre: 'RAM', precio: 50, quantity: 1, tipo: 'ram' } as Product & { quantity?: number },
      storage: { id: '5', nombre: 'SSD', precio: 70, tipo: 'SSD' } as Product,
    };
    // Base (50) + CPU AMD (65) + GPU (120) + RAM (5*1=5) + SSD (5) = 245
    expect(calculateTotalWattage(build)).toBe(245);
  });

  it('should handle missing GPU wattage', () => {
    const build: PCBuild = {
      platform: 'intel',
      cpu: { id: '1', nombre: 'CPU Intel', precio: 100, tipo: 'cpu' } as Product,
      gpu: { id: '4', nombre: 'GPU', precio: 200, tipo: 'gpu' } as Product, // No watts property
    };
    // Base (50) + CPU Intel (95) + GPU (0) = 145
    expect(calculateTotalWattage(build)).toBe(145);
  });

  it('should handle default wattage for unknown storage type', () => {
    const build: PCBuild = {
      storage: { id: '5', nombre: 'Unknown Storage', precio: 70, tipo: 'UNKNOWN' } as Product,
    };
    // Base (50) + Unknown Storage (5) = 55
    expect(calculateTotalWattage(build)).toBe(55);
  });

   it('should handle default wattage for unknown storage type in array', () => {
    const build: PCBuild = {
      storage: [
        { id: '5', nombre: 'Unknown Storage', precio: 70, tipo: 'UNKNOWN' } as Product,
        { id: '6', nombre: 'SSD', precio: 70, tipo: 'SSD' } as Product,
    ]
    };
    // Base (50) + Unknown Storage (5) + SSD (5) = 60
    expect(calculateTotalWattage(build)).toBe(60);
  });
});
