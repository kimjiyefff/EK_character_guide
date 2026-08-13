import { useState } from 'react'
import { ImagePlaceholder } from './ImagePlaceholder'
import { downloadImage } from '../utils/download'
import { useCopyToast, Toast } from '../hooks/useCopyToast'

interface Props {
  src: string | null | undefined
  alt: string
  downloadName?: string
  wide?: boolean
  placeholderLabel?: string
  showDownload?: boolean
}

export function CharacterImage({
  src,
  alt,
  downloadName,
  wide,
  placeholderLabel,
  showDownload = true,
}: Props) {
  const { toast, setToast } = useCopyToast()
  const [busy, setBusy] = useState(false)

  const handleDownload = async () => {
    if (!src || !downloadName) return
    setBusy(true)
    try {
      await downloadImage(src, downloadName)
      setToast('이미지를 다운로드했습니다')
    } catch {
      setToast('다운로드에 실패했습니다')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="asset-media">
      {src ? (
        <img src={src} alt={alt} className={`asset-img${wide ? ' wide' : ''}`} />
      ) : (
        <ImagePlaceholder label={placeholderLabel ?? alt} wide={wide} />
      )}

      {showDownload && src && downloadName && (
        <button
          type="button"
          className="btn btn-secondary btn-sm asset-download-btn"
          onClick={handleDownload}
          disabled={busy}
        >
          {busy ? '다운로드 중…' : '이미지 다운로드'}
        </button>
      )}
      <Toast message={toast} />
    </div>
  )
}
