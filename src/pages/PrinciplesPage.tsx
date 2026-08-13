import { Link } from 'react-router-dom'
import { FLOW_STEPS, PRINCIPLES } from '../data/content'

export function PrinciplesPage() {
  return (
    <div className="page">
      <h1 className="page-title">AI 2D → 3D 캐릭터 제작 가이드</h1>
      <p className="page-desc">
        회사 캐릭터를 AI로 3D 이미지 및 영상으로 제작할 때 발생하는 얼굴, 형태, 비율, 색상, 의상 등의
        변형을 방지하고 모든 부서가 동일한 캐릭터 기준으로 제작하기 위한 사내 표준 가이드다.
      </p>

      <div className="hero-message">
        <p>3D 변환은 캐릭터 재디자인이 아닙니다.</p>
        <p>원본 캐릭터의 정체성은 유지하고 자연스러운 3D 입체감만 적용합니다.</p>
      </div>

      <section className="section-block">
        <h2 className="section-title">공통 원칙</h2>
        <div className="principle-grid four">
          {PRINCIPLES.map((item) => (
            <article key={item.title} className="principle-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">공통 제작 흐름</h2>
        <ol className="flow-steps">
          {FLOW_STEPS.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-block aux-section">
        <h2 className="section-title">다음 단계</h2>
        <p className="section-desc">관련 작업은 아래 메뉴에서 이어가세요.</p>
        <div className="btn-row">
          <Link to="/character" className="btn btn-primary">캐릭터 기준 확인</Link>
          <Link to="/prompt" className="btn btn-secondary">프롬프트 만들기</Link>
        </div>
        <div className="info-box" style={{ marginTop: 16 }}>
          파일 관리 · 제작 절차 · 보고용 요약은 별도 메뉴 없이 각 페이지 하단 보조 콘텐츠로 제공합니다.
        </div>
      </section>
    </div>
  )
}
