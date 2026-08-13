import {
  CHARACTERS,
  MAX_HEIGHT_UNITS,
  SIZE_GUIDELINES,
  type CharacterId,
} from '../data/characters'
import { useAppState } from '../context/AppContext'

/** Visual height vs Hapa (100%), kept in sync with CSS vars on .size-guide */
const SIZE_HEIGHT_VAR: Record<CharacterId, string> = {
  tipa: 'var(--size-tipa)',
  kini: 'var(--size-kini)',
  pani: 'var(--size-pani)',
  huni: 'var(--size-huni)',
  hapa: 'var(--size-hapa)',
}

export function SizeGuide() {
  const { selectedCharacterId, setSelectedCharacterId } = useAppState()

  return (
    <section className="size-guide">
      <h2 className="section-title">캐릭터 5종 비율 및 사이즈 기준</h2>
      <p className="section-desc">
        하파를 기준(5단위)으로 상대 비율을 적용하세요. 캐릭터를 클릭하면 해당 기준으로 전환됩니다.
      </p>

      <div className="size-chart panel">
        <div className="size-chart-plot">
          <div className="size-chart-grid" aria-hidden>
            {Array.from({ length: MAX_HEIGHT_UNITS + 1 }, (_, i) => {
              const unit = MAX_HEIGHT_UNITS - i
              return (
                <div
                  key={unit}
                  className="size-grid-line"
                  style={{ bottom: `${(unit / MAX_HEIGHT_UNITS) * 100}%` }}
                >
                  <span>{unit}</span>
                </div>
              )
            })}
          </div>

          <div className="size-chart-characters">
            {CHARACTERS.map((character) => {
              const selected = selectedCharacterId === character.id
              const id = character.id as CharacterId
              return (
                <button
                  key={character.id}
                  type="button"
                  className={`size-char-col${selected ? ' selected' : ''}`}
                  onClick={() => setSelectedCharacterId(id)}
                >
                  <div className="size-char-stage">
                    <div
                      className={`size-char-figure size-char-figure--${id}`}
                      style={{ height: SIZE_HEIGHT_VAR[id] }}
                    >
                      {character.sizeThumbUrl ? (
                        <img
                          src={character.sizeThumbUrl}
                          alt={character.name}
                          draggable={false}
                        />
                      ) : (
                        <div
                          className="size-char-fallback"
                          style={{ background: character.color }}
                        >
                          {character.name}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="size-chart-labels">
          {CHARACTERS.map((character) => {
            const selected = selectedCharacterId === character.id
            return (
              <button
                key={character.id}
                type="button"
                className={`size-char-meta${selected ? ' selected' : ''}`}
                onClick={() =>
                  setSelectedCharacterId(character.id as CharacterId)
                }
              >
                <strong>{character.name}</strong>
                <span>
                  {character.heightUnits} / {MAX_HEIGHT_UNITS}
                </span>
                {selected && <em className="selected-tag">선택됨</em>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="warning-box" style={{ marginTop: 16 }}>
        캐릭터의 비율은 반드시 위의 비율대로 적용되어야 합니다.
      </div>

      <div className="size-rules panel" style={{ marginTop: 16 }}>
        <h3 className="section-title" style={{ fontSize: 16 }}>
          캐릭터 사용 가이드라인
        </h3>
        <ol className="size-rules-list">
          {SIZE_GUIDELINES.map((rule, index) => (
            <li key={rule}>
              <span className="rule-num">{index + 1}</span>
              <span>{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
