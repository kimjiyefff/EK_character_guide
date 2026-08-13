import type { PromptContent } from '../types'
import { useCopyToast, Toast } from '../hooks/useCopyToast'

interface Props {
  prompt: PromptContent
  title?: string
}

export function PromptBox({ prompt, title = '복사해서 사용하는 프롬프트' }: Props) {
  const { toast, copy } = useCopyToast()

  return (
    <>
      <div className="prompt-box">
        <div className="prompt-box-header">
          <span>{title}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => copy(prompt.raw)}
          >
            프롬프트 복사
          </button>
        </div>
        <pre>{prompt.raw}</pre>
      </div>

      {prompt.sections.length > 0 && (
        <div className="prompt-sections">
          {prompt.sections.map((section) => (
            <div key={section.title} className="prompt-section">
              <h4>[{section.title}]</h4>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Toast message={toast} />
    </>
  )
}
