import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_CHARACTER_ID,
  getCharacter,
  type CharacterId,
  type CharacterRecord,
} from '../data/characters'

interface AppState {
  selectedCharacterId: CharacterId
  selectedCharacter: CharacterRecord
  setSelectedCharacterId: (id: CharacterId) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCharacterId, setSelectedCharacterIdState] =
    useState<CharacterId>(DEFAULT_CHARACTER_ID)

  const selectedCharacter = useMemo(
    () => getCharacter(selectedCharacterId),
    [selectedCharacterId],
  )

  const value = useMemo(
    () => ({
      selectedCharacterId,
      selectedCharacter,
      setSelectedCharacterId: (id: CharacterId) => {
        setSelectedCharacterIdState(id)
      },
    }),
    [selectedCharacterId, selectedCharacter],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppState must be used within AppProvider')
  return ctx
}
