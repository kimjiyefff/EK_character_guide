export interface QaItem {
  id: string
  label: string
  critical: boolean
}

export const QA_ITEMS: QaItem[] = [
  { id: 'face-shape', label: '얼굴형이 동일한가?', critical: true },
  { id: 'features', label: '눈·코·입의 형태와 위치가 동일한가?', critical: true },
  { id: 'ratio', label: '머리와 신체 비율이 유지되었는가?', critical: true },
  { id: 'silhouette', label: '전체 실루엣이 유지되었는가?', critical: true },
  { id: 'color', label: '캐릭터 고유 색상이 유지되었는가?', critical: true },
  { id: 'outfit-acc', label: '의상과 액세서리가 유지되었는가?', critical: true },
  { id: 'hair', label: '머리 형태가 동일한가?', critical: false },
  { id: 'detail', label: '불필요한 디테일 추가/삭제가 없는가?', critical: false },
]

export interface ProblemType {
  id: string
  title: string
  steps: { label: string; content: string }[]
  fallback: string
}

export const PROBLEMS: ProblemType[] = [
  {
    id: 'face',
    title: '얼굴이 달라졌어요',
    steps: [
      { label: '1차', content: 'MASTER Reference 사용 여부 확인' },
      { label: '2차', content: '불필요한 스타일 지시 제거' },
      { label: '3차', content: '동일 조건으로 2~3회 재생성' },
    ],
    fallback: '프롬프트 수정 중단 → 다른 제작 방식 검토',
  },
  {
    id: 'body',
    title: '신체 비율이 달라졌어요',
    steps: [
      { label: '1차', content: '정면·측면 비율 가이드 첨부 확인' },
      { label: '2차', content: '비율 변경 관련 프롬프트 제거' },
      { label: '3차', content: 'MASTER 전신 이미지 재첨부' },
    ],
    fallback: '프롬프트 수정 중단 → ControlNet / 실제 3D 모델링 검토',
  },
  {
    id: 'pose-fail',
    title: '포즈가 제대로 안 나와요',
    steps: [
      { label: '1차', content: 'POSE REFERENCE 이미지 품질 확인' },
      { label: '2차', content: 'MASTER와 POSE를 명확히 분리 입력' },
      { label: '3차', content: '포즈만 참고한다는 지시 강화' },
    ],
    fallback: '프롬프트 수정 중단 → ControlNet / OpenPose 사용',
  },
  {
    id: 'costume',
    title: '의상이 바뀌었어요',
    steps: [
      { label: '1차', content: 'MASTER의 의상 상세 이미지 추가' },
      { label: '2차', content: '의상 변경 금지 지시 확인' },
      { label: '3차', content: '장면 참조의 다른 의상 영향 제거' },
    ],
    fallback: '프롬프트 수정 중단 → 의상 기준 이미지 강화 후 재시도',
  },
  {
    id: 'color',
    title: '색상이 달라졌어요',
    steps: [
      { label: '1차', content: '컬러 기준 이미지/HEX 확인' },
      { label: '2차', content: '조명/필터 지시 최소화' },
      { label: '3차', content: '고유 색상 유지 지시 명시' },
    ],
    fallback: '프롬프트 수정 중단 → COLOR 기준으로 재작업',
  },
  {
    id: 'inconsistent',
    title: '캐릭터가 매번 다르게 나와요',
    steps: [
      { label: '1차', content: '승인된 MASTER 단일 기준으로 고정' },
      { label: '2차', content: '매번 2D 원본 변환하지 않기' },
      { label: '3차', content: '동일 조건으로 재생성' },
    ],
    fallback: '프롬프트 수정 중단 → LoRA 또는 실제 3D 모델링 검토',
  },
]

export type QaVerdict = '승인 요청 가능' | '수정 후 재검수' | '사용 불가' | '검수 진행 중'

export function judgeQa(
  checked: Record<string, boolean>,
): { verdict: QaVerdict; criticalFail: number; generalFail: number; done: number } {
  const critical = QA_ITEMS.filter((i) => i.critical)
  const general = QA_ITEMS.filter((i) => !i.critical)
  const done = QA_ITEMS.filter((i) => checked[i.id]).length
  const criticalFail = critical.filter((i) => !checked[i.id]).length
  const generalFail = general.filter((i) => !checked[i.id]).length

  if (done === 0) return { verdict: '검수 진행 중', criticalFail, generalFail, done }
  if (criticalFail > 0) return { verdict: '사용 불가', criticalFail, generalFail, done }
  if (generalFail > 0) return { verdict: '수정 후 재검수', criticalFail, generalFail, done }
  return { verdict: '승인 요청 가능', criticalFail, generalFail, done }
}
