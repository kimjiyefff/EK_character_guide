import { useEffect, useState } from 'react'
import { HUNI_TURNAROUND_VIEWS, type TurnaroundView } from '../data/turnaround'

interface Props {
  characterId: string
}

export function TurnaroundThumbs({ characterId }: Props) {
  const [active, setActive] = useState<TurnaroundView | null>(null)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  if (characterId !== 'huni') return null

  return (
    <section className="section-block turnaround-section">
      <h3 className="section-title" style={{ fontSize: 18 }}>
        후니 · 캐릭터 턴어라운드
      </h3>
      <p className="section-desc">
        각도별 이미지를 확인하세요. 썸네일을 클릭하면 확대됩니다.
      </p>

      <div className="turnaround-grid">
        {HUNI_TURNAROUND_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className="turnaround-card"
            onClick={() => setActive(view)}
            aria-label={`${view.label} 확대 보기`}
          >
            <div className="turnaround-frame">
              <img src={view.src} alt={view.label} draggable={false} />
            </div>
            <strong className="turnaround-label">{view.label}</strong>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="modal-backdrop"
          onClick={() => setActive(null)}
          role="presentation"
        >
          <div
            className="modal-panel turnaround-modal-panel"
            role="dialog"
            aria-modal="true"
            aria-label={active.label}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <strong>후니 · {active.label}</strong>
                <p>턴어라운드 개별 이미지</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setActive(null)}
              >
                닫기
              </button>
            </div>
            <div className="modal-body turnaround-modal-body">
              <div className="turnaround-frame turnaround-frame-lg">
                <img src={active.src} alt={active.label} draggable={false} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
