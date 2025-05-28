import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string | number
  type: string
  name: string
  price: number
  quantity: number
  image?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string | number, itemType: string) => void
  updateQuantity: (itemId: string | number, itemType: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingItemIndex = items.findIndex((i) => i.id === item.id && i.type === item.type)

        if (existingItemIndex !== -1) {
          // Si el item ya existe, actualiza la cantidad
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += item.quantity
          set({ items: updatedItems })
        } else {
          // Si es un nuevo item, agrégalo al carrito
          set({ items: [...items, item] })
        }
      },

      removeItem: (itemId, itemType) => {
        const { items } = get()
        set({
          items: items.filter((item) => !(item.id === itemId && item.type === itemType)),
        })
      },

      updateQuantity: (itemId, itemType, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => {
          if (item.id === itemId && item.type === itemType) {
            return { ...item, quantity }
          }
          return item
        })
        set({ items: updatedItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
