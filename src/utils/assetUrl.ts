/** public/ 자산 경로에 Vite base(GitHub Pages 서브패스)를 붙입니다. */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${base}${normalized}`
}
