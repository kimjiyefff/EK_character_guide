import { useEffect, useState } from 'react'

export function useCopyToast() {
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  const copy = async (text: string, message = '프롬프트를 복사했습니다') => {
    try {
      await navigator.clipboard.writeText(text)
      setToast(message)
    } catch {
      setToast('복사에 실패했습니다. 직접 선택해 복사해주세요.')
    }
  }

  return { toast, copy, setToast }
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="toast">{message}</div>
}
