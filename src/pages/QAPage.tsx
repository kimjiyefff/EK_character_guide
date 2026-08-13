import { useEffect, useMemo, useState } from 'react'
import { CharacterSelector } from '../components/CharacterSelector'
import { useAppState } from '../context/AppContext'
import { QA_ITEMS, PROBLEMS, judgeQa } from '../data/qa'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { CharacterImage } from '../components/CharacterImage'

const QA_STORAGE_KEY = 'ai-character-guide-qa-checks'

export function QAPage() {
  const { selectedCharacter } = useAppState()
  const [tab, setTab] = useState<'qa' | 'trouble'>('qa')
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(QA_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
    } catch {
      return {}
    }
  })
  const [openProblem, setOpenProblem] = useState(PROBLEMS[0].id)

  useEffect(() => {
    localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(checked))
  }, [checked])

  const judgment = useMemo(() => judgeQa(checked), [checked])
  const selectedProblem = PROBLEMS.find((p) => p.id === openProblem) ?? PROBLEMS[0]
  const master =
    selectedCharacter.images.find((i) => i.category === 'master3D' && i.fileUrl) ??
    selectedCharacter.images.find((i) => i.fileUrl)

  return (
    <div className="page">
      <h1 className="page-title">QA 검수 및 문제 해결</h1>
      <p className="page-desc">
        핵심 필수 항목이 하나라도 불일치하면 사용 불가입니다. 최종 승인은 디자인팀에서 합니다.
      </p>

      <CharacterSelector />

      <div className="tab-list" style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`tab-btn${tab === 'qa' ? ' active' : ''}`}
          onClick={() => setTab('qa')}
        >
          QA 체크리스트
        </button>
        <button
          type="button"
          className={`tab-btn${tab === 'trouble' ? ' active' : ''}`}
          onClick={() => setTab('trouble')}
        >
          문제 해결
        </button>
      </div>

      {tab === 'qa' ? (
        <>
          <div className="compare-grid" style={{ margin: '20px 0' }}>
            <div className="compare-panel">
              <div className="compare-label">MASTER · {selectedCharacter.name}</div>
              {master?.fileUrl ? (
                <CharacterImage
                  src={master.fileUrl}
                  alt={master.name}
                  downloadName={master.fileName}
                />
              ) : (
                <ImagePlaceholder label="MASTER 이미지" />
              )}
            </div>
            <div className="compare-panel">
              <div className="compare-label">RESULT</div>
              <ImagePlaceholder label="외부 AI 결과와 비교" />
            </div>
          </div>

          <div className="qa-status">
            <div className="qa-count">
              검수 완료 {judgment.done} / {QA_ITEMS.length}
            </div>
            <span
              className={`status-badge ${
                judgment.verdict === '승인 요청 가능'
                  ? 'pass'
                  : judgment.verdict === '사용 불가'
                    ? 'fail'
                    : 'warn'
              }`}
            >
              {judgment.verdict}
            </span>
          </div>

          <div className="checklist" style={{ marginBottom: 16 }}>
            {QA_ITEMS.map((item) => {
              const isChecked = !!checked[item.id]
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`check-item${isChecked ? ' checked' : ''}`}
                  onClick={() =>
                    setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                >
                  <span className="check-box" aria-hidden>
                    {isChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="m5 12 5 5L19 7" />
                      </svg>
                    )}
                  </span>
                  <span>
                    {item.label}
                    {item.critical && <em className="critical-tag">핵심</em>}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="info-box">
            최종 승인은 디자인팀에서 진행합니다. 이 페이지의 판정은 사전 검수 기준입니다.
          </div>

          <div className="btn-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setChecked({})}
            >
              체크 초기화
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="problem-grid" style={{ marginTop: 20 }}>
            {PROBLEMS.map((problem) => (
              <button
                key={problem.id}
                type="button"
                className={`problem-card${openProblem === problem.id ? ' open' : ''}`}
                onClick={() => setOpenProblem(problem.id)}
              >
                <h3>{problem.title}</h3>
              </button>
            ))}
          </div>
          <div className="problem-detail">
            <h3>{selectedProblem.title}</h3>
            {selectedProblem.steps.map((step) => (
              <div key={step.label} className="solve-step">
                <div className="solve-label">{step.label}</div>
                <div className="solve-content">{step.content}</div>
              </div>
            ))}
            <div className="warning-box" style={{ marginTop: 16 }}>
              그래도 실패: {selectedProblem.fallback}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
