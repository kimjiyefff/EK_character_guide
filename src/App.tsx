import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { AppProvider } from './context/AppContext'
import { PrinciplesPage } from './pages/PrinciplesPage'
import { CharacterStandardsPage } from './pages/CharacterStandardsPage'
import { PromptPage } from './pages/PromptPage'
import { QAPage } from './pages/QAPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="app-shell with-sidebar">
          <Sidebar />
          <main className="main-content sidebar-main">
            <Routes>
              <Route path="/" element={<PrinciplesPage />} />
              <Route path="/character" element={<CharacterStandardsPage />} />
              <Route path="/prompt" element={<PromptPage />} />
              <Route path="/qa" element={<QAPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
