import {
  getSelectableCharacters,
  type CharacterId,
} from '../data/characters'
import { useAppState } from '../context/AppContext'

export function CharacterSelector() {
  const { selectedCharacterId, setSelectedCharacterId } = useAppState()
  const characters = getSelectableCharacters()

  return (
    <div className="character-selector character-selector-5">
      {characters.map((character) => {
        const selected = selectedCharacterId === character.id
        return (
          <button
            key={character.id}
            type="button"
            className={`character-selector-card${selected ? ' selected' : ''}`}
            onClick={() => setSelectedCharacterId(character.id as CharacterId)}
          >
            <div className="character-selector-thumb">
              {character.thumbUrl ? (
                <img
                  src={character.thumbUrl}
                  alt={character.name}
                  draggable={false}
                />
              ) : (
                <span style={{ background: character.color }}>{character.name[0]}</span>
              )}
              {selected && (
                <span className="character-selector-check" aria-label="선택됨">
                  ✓
                </span>
              )}
            </div>
            <strong>{character.name}</strong>
            <span>{character.subtitle}</span>
          </button>
        )
      })}
    </div>
  )
}
