import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildStoreState } from './storeState'
import type { AppStore } from './storeState'

export { type AppStore }

export const useStore = create<AppStore>()(
  persist(buildStoreState, {
    name: 'jeffnotes-storage',
  })
)
