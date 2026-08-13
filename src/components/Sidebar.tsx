import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../data/content'

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label="메뉴"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '닫기' : '메뉴'}
      </button>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="logo-mark">AI</span>
          <div>
            <strong>AI 캐릭터 가이드</strong>
            <p>2D → 3D 사내 표준</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">사내 실무 가이드</div>
      </aside>

      {open && <button type="button" className="sidebar-backdrop" aria-label="닫기" onClick={() => setOpen(false)} />}
    </>
  )
}
