import { useState } from 'react'
import type { CharacterImageAsset } from '../data/characters'
import { downloadImage } from '../utils/download'
import { ImageModal } from './ImageModal'
import { useCopyToast, Toast } from '../hooks/useCopyToast'

interface Props {
  assets: CharacterImageAsset[]
  title: string
}

export function AssetCardGrid({ assets, title }: Props) {
  const [modalAsset, setModalAsset] = useState<CharacterImageAsset | null>(null)
  const { toast, setToast } = useCopyToast()

  const readyAssets = assets.filter((asset) => !!asset.fileUrl)
  const visibleAssets = readyAssets.length > 0 ? readyAssets : assets

  return (
    <section className={`section-block${title ? '' : ' section-block-embed'}`}>
      {title ? (
        <div className="asset-section-head">
          <h3 className="section-title" style={{ fontSize: 18, margin: 0 }}>
            {title}
          </h3>
        </div>
      ) : null}

      {visibleAssets.length === 0 ? (
        <div className="warning-box">등록된 이미지가 없습니다.</div>
      ) : (
        <div className="asset-card-grid">
          {visibleAssets.map((asset) => {
            const ready = !!asset.fileUrl
            return (
              <article key={asset.id} className="asset-meta-card">
                <button
                  type="button"
                  className="asset-preview-btn"
                  onClick={() => ready && setModalAsset(asset)}
                  aria-label={`${asset.name} 확대 보기`}
                  disabled={!ready}
                >
                  {ready ? (
                    <img src={asset.fileUrl!} alt={asset.name} />
                  ) : (
                    <div className="asset-preview-empty">자료 준비 중</div>
                  )}
                </button>
                <div className="asset-meta-body">
                  <strong>{asset.name}</strong>
                  <ul>
                    <li>형식: {asset.format}</li>
                    <li>버전: {asset.version}</li>
                  </ul>
                  <div className="btn-row" style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      disabled={!ready}
                      onClick={async () => {
                        if (!asset.fileUrl) return
                        await downloadImage(asset.fileUrl, asset.fileName)
                        setToast('이미지를 다운로드했습니다')
                      }}
                    >
                      {ready ? '다운로드' : '자료 준비 중'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ImageModal asset={modalAsset} onClose={() => setModalAsset(null)} />
      <Toast message={toast} />
    </section>
  )
}
