import { CharacterSelector } from '../components/CharacterSelector'
import { AssetCardGrid } from '../components/AssetCardGrid'
import { SizeGuide } from '../components/SizeGuide'
import { TurnaroundThumbs } from '../components/TurnaroundThumbs'
import { useAppState } from '../context/AppContext'
import { getImagesByCategory, type ColorChip } from '../data/characters'
import { useCopyToast, Toast } from '../hooks/useCopyToast'

function mergeColorsByHex(colors: ColorChip[]): ColorChip[] {
  const merged = new Map<string, ColorChip>()
  for (const color of colors) {
    const key = color.hex.toUpperCase()
    const existing = merged.get(key)
    if (existing) {
      const parts = new Set(
        `${existing.part} / ${color.part}`
          .split(/\s*\/\s*/)
          .map((p) => p.trim())
          .filter(Boolean),
      )
      existing.part = [...parts].join(' / ')
    } else {
      merged.set(key, { ...color })
    }
  }
  return [...merged.values()]
}

export function CharacterStandardsPage() {
  const { selectedCharacter } = useAppState()
  const { toast, copy } = useCopyToast()

  const original2D = getImagesByCategory(selectedCharacter, 'original2D')
  const master3D = getImagesByCategory(selectedCharacter, 'master3D')
  const details = getImagesByCategory(selectedCharacter, 'details')
  const colors = mergeColorsByHex(selectedCharacter.colors)

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">캐릭터 기준</h1>
          <p className="page-desc">
            티파 · 키니 · 파니 · 후니 · 하파의 공식 이미지, 비율, 고정 특징을 확인하고 다운로드하세요.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!selectedCharacter.zipUrl}
          title={selectedCharacter.zipUrl ? '전체 다운로드' : '파일 연결 필요'}
        >
          {selectedCharacter.zipUrl
            ? '선택 캐릭터 기준 자료 전체 다운로드'
            : '전체 다운로드 · 파일 연결 필요'}
        </button>
      </div>

      <section className="section-block">
        <SizeGuide />
      </section>

      <section className="section-block">
        <h2 className="section-title">캐릭터 선택</h2>
        <CharacterSelector />
        <div className="active-task-bar" style={{ marginTop: 16 }}>
          <div className="active-task-label">
            현재 선택: <strong>{selectedCharacter.name}</strong>
            <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
              {selectedCharacter.subtitle}
            </span>
          </div>
        </div>
      </section>

      <div className="asset-side-by-side">
        <AssetCardGrid
          assets={original2D}
          title={`${selectedCharacter.name} · 2D 원본 이미지`}
        />
        <AssetCardGrid
          assets={master3D}
          title={`${selectedCharacter.name} · 3D 마스터 이미지`}
        />
      </div>

      <TurnaroundThumbs characterId={selectedCharacter.id} />

      <section className="section-block">
        <h3 className="section-title" style={{ fontSize: 18 }}>
          {selectedCharacter.name} · 디자인 세부 기준
        </h3>

        <h4 className="section-title" style={{ fontSize: 16, marginTop: 8 }}>
          컬러
        </h4>
        <div className="color-chip-grid" style={{ marginBottom: 24 }}>
          {colors.map((color) => (
            <div key={color.hex} className="color-chip">
              <div className="color-swatch" style={{ background: color.hex }} />
              <div>
                <strong>{color.part}</strong>
                <p>HEX {color.hex}</p>
                <p>RGB {color.rgb}</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => copy(color.hex, '컬러 코드를 복사했습니다')}
                >
                  컬러 복사
                </button>
              </div>
            </div>
          ))}
        </div>

        <AssetCardGrid
          assets={details.filter((item) => !item.id.endsWith('-detail-color'))}
          title=""
        />
      </section>

      <section className="section-block">
        <h2 className="section-title">{selectedCharacter.name} 고정 정보</h2>
        <div className="feature-grid">
          <FeatureBlock title="얼굴" items={selectedCharacter.fixedFeatures.face} />
          <FeatureBlock title="신체" items={selectedCharacter.fixedFeatures.body} />
          <FeatureBlock title="의상" items={selectedCharacter.fixedFeatures.outfit} />
          <FeatureBlock title="액세서리" items={selectedCharacter.fixedFeatures.accessories} />
          <FeatureBlock title="캐릭터 고유 특징" items={selectedCharacter.fixedFeatures.unique} />
          {selectedCharacter.personality.length > 0 && (
            <FeatureBlock title="성격 및 역할" items={selectedCharacter.personality} />
          )}
        </div>
      </section>

      <Toast message={toast} />
    </div>
  )
}

function FeatureBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="feature-block">
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>등록된 항목 없음</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
