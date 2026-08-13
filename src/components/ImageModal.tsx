import { useEffect } from 'react'
import { downloadImage } from '../utils/download'
import type { CharacterImageAsset } from '../data/characters'

interface Props {
  asset: CharacterImageAsset | null
  onClose: () => void
}

export function ImageModal({ asset, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!asset) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={asset.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <strong>{asset.name}</strong>
            <p>
              {asset.format} · {asset.version} · {asset.approvalStatus}
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="modal-body">
          {asset.fileUrl ? (
            <img src={asset.fileUrl} alt={asset.name} />
          ) : (
            <div className="placeholder wide">자료 준비 중</div>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!asset.fileUrl}
            onClick={() => asset.fileUrl && downloadImage(asset.fileUrl, asset.fileName)}
          >
            {asset.fileUrl ? '다운로드' : '자료 준비 중'}
          </button>
        </div>
      </div>
    </div>
  )
}
