import { useState } from 'react'
import type { ChecklistItem } from '../types'

interface Props {
  items: ChecklistItem[]
  title?: string
}

export function Checklist({ items, title }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      {title && <div className="label-sm">{title}</div>}
      <div className="checklist">
        {items.map((item) => {
          const isChecked = !!checked[item.id]
          return (
            <button
              key={item.id}
              type="button"
              className={`check-item${isChecked ? ' checked' : ''}`}
              onClick={() => toggle(item.id)}
              aria-pressed={isChecked}
            >
              <span className="check-box" aria-hidden>
                {isChecked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 12 5 5L19 7" />
                  </svg>
                )}
              </span>
              <span className="check-label-group">
                {item.required && <span className="check-tag">필수</span>}
                <span>{item.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
