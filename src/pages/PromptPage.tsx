import { useMemo, useState } from 'react'
import { CharacterSelector } from '../components/CharacterSelector'
import { useAppState } from '../context/AppContext'
import { PROMPT_TABS, PURPOSE_PROMPTS, type PromptTabId } from '../data/content'
import { hasMeasuredRatio } from '../data/characters'
import { buildCommonPromptBlock, useBuiltPrompt } from '../utils/promptBuilder'
import { useCopyToast, Toast } from '../hooks/useCopyToast'

type PromptView = Exclude<PromptTabId, 'common'>

export function PromptPage() {
  const { selectedCharacter } = useAppState()
  const [view, setView] = useState<PromptView>('2d-to-3d')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [showRequired, setShowRequired] = useState(false)
  const { toast, copy, setToast } = useCopyToast()
  const measured = hasMeasuredRatio(selectedCharacter)

  const commonText = useMemo(() => buildCommonPromptBlock(), [])
  const built = useBuiltPrompt(selectedCharacter, view, inputs)
  const purpose = useMemo(() => PURPOSE_PROMPTS.find((p) => p.id === view), [view])

  const purposeOnlyText = useMemo(() => {
    if (!purpose) return ''
    const userLines = purpose.inputFields
      .map((field) => {
        const value = inputs[field.key]?.trim()
        return value ? `- ${field.label}: ${value}` : null
      })
      .filter(Boolean)

    const purposeForbidden =
      purpose.forbidden && purpose.forbidden.length > 0
        ? `\n\n[목적별 변경 금지]\n${purpose.forbidden.map((v) => `- ${v}`).join('\n')}`
        : ''

    return `[제작 목적 · ${purpose.id}]
${purpose.purpose}

${purpose.coreLine}

${purpose.rules.length ? `[목적별 지시]\n${purpose.rules.map((v) => `- ${v}`).join('\n')}` : ''}

[사용자 입력]
${userLines.length ? userLines.join('\n') : '- (입력 없음)'}

[출력 조건]
- ${inputs.output?.trim() || inputs.background?.trim() || inputs.ratio?.trim() || '요청된 출력 형식 유지'}${purposeForbidden}`
  }, [purpose, inputs])

  const reset = () => {
    setInputs({})
    setShowRequired(false)
    setToast('입력을 초기화했습니다')
  }

  return (
    <div className="page">
      <h1 className="page-title">프롬프트</h1>
      <p className="page-desc">
        상단의 전체 공통사항(비율 고정 포함)을 먼저 사용하고, 아래에서 제작 목적별 프롬프트를
        선택하세요.
      </p>

      <section className="section-block">
        <h2 className="section-title">전체 공통사항 프롬프트</h2>
        <div className="tag-row">
          {['전체 공통', '반드시 유지', '변경 가능', '변경 금지 조건', '비율 고정', '상대 사이즈'].map(
            (tag) => (
              <span key={tag} className="info-tag">
                {tag}
              </span>
            ),
          )}
        </div>
        <div className="prompt-box" style={{ marginTop: 12 }}>
          <div className="prompt-box-header">
            <span>공통사항만</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copy(commonText, '프롬프트를 복사했습니다')}
            >
              프롬프트 복사
            </button>
          </div>
          <pre>{commonText}</pre>
        </div>
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => copy(commonText, '프롬프트를 복사했습니다')}
          >
            프롬프트 복사
          </button>
        </div>
      </section>

      <div className="tab-list">
        {PROMPT_TABS.filter(
          (t): t is { id: Exclude<PromptTabId, 'common'>; label: string } =>
            t.id !== 'common',
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab-btn${view === item.id ? ' active' : ''}`}
            onClick={() => {
              setView(item.id)
              setShowRequired(false)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="section-block">
        <h2 className="section-title">캐릭터 선택</h2>
        <p className="section-desc">
          기준 이미지·검수 시 사용할 캐릭터를 선택합니다. 비율 고정 문구는 상단 공통사항에
          포함되어 있습니다.
        </p>
        <CharacterSelector />
        {!measured && (
          <div className="danger-box" style={{ marginTop: 16 }}>
            이 캐릭터는 비율 수치가 아직 등록되지 않았습니다. 정면·측면 기준 이미지를 반드시
            첨부하세요.
          </div>
        )}
      </section>

      {purpose && (
        <section className="section-block">
          <h2 className="section-title">
            {PROMPT_TABS.find((t) => t.id === view)?.label}
          </h2>
          <p className="section-desc">{purpose.purpose}</p>
          <div className="info-box" style={{ marginBottom: 16 }}>
            {purpose.coreLine}
          </div>

          <h3 className="label-sm">필수 기준 이미지</h3>
          <ul className="bullet-list">
            {purpose.requiredImages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {purpose.rules.length > 0 && (
            <>
              <h3 className="label-sm" style={{ marginTop: 16 }}>
                목적별 지시
              </h3>
              <ul className="bullet-list">
                {purpose.rules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <div className="input-grid" style={{ marginTop: 16 }}>
            {purpose.inputFields.map((field) => (
              <label key={field.key} className="field">
                <span>{field.label}</span>
                <input
                  value={inputs[field.key] ?? ''}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <h2 className="section-title">
          {selectedCharacter.name} · {PROMPT_TABS.find((t) => t.id === view)?.label} 프롬프트
        </h2>
        <div className="tag-row">
          {built.tags.map((tag) => (
            <span key={tag} className="info-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="prompt-box" style={{ marginTop: 12 }}>
          <div className="prompt-box-header">
            <span>목적별 프롬프트</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => copy(purposeOnlyText, '프롬프트를 복사했습니다')}
            >
              프롬프트 복사
            </button>
          </div>
          <pre>{purposeOnlyText}</pre>
        </div>

        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => copy(purposeOnlyText, '프롬프트를 복사했습니다')}
          >
            프롬프트 복사
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowRequired(true)}
          >
            필수 이미지 확인
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
            입력 초기화
          </button>
        </div>

        {showRequired && purpose && (
          <div className="panel" style={{ marginTop: 16 }}>
            <h3 className="section-title" style={{ fontSize: 16 }}>
              필수 이미지 목록
            </h3>
            <ul className="bullet-list">
              {purpose.requiredImages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="section-desc" style={{ marginTop: 12, marginBottom: 0 }}>
              실제 파일은 캐릭터 기준 페이지에서 다운로드하세요.
            </p>
          </div>
        )}
      </section>

      <Toast message={toast} />
    </div>
  )
}
