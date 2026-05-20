import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildStoreState } from './testExports'
import type { AppStore } from './testExports'

export { type AppStore }

export const useStore = create<AppStore>()(
  persist(buildStoreState, {
    name: 'jeffnotes-storage',
  })
)
