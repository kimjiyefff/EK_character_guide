/** Huni turnaround — split from Turnaround.png (1536×1024) */

export type TurnaroundViewId =
  | 'front'
  | 'threeQuarter'
  | 'side'
  | 'rearThreeQuarter'
  | 'back'

export interface TurnaroundView {
  id: TurnaroundViewId
  label: string
  /** Individual cropped file under public/characters/huni/ */
  src: string
}

export const HUNI_TURNAROUND_VIEWS: TurnaroundView[] = [
  { id: 'front', label: '정면', src: '/characters/huni/TURNAROUND_FRONT.png' },
  { id: 'threeQuarter', label: '45도 측면', src: '/characters/huni/TURNAROUND_45.png' },
  { id: 'side', label: '측면', src: '/characters/huni/TURNAROUND_SIDE.png' },
  {
    id: 'rearThreeQuarter',
    label: '45도 후면',
    src: '/characters/huni/TURNAROUND_REAR_45.png',
  },
  { id: 'back', label: '후면', src: '/characters/huni/TURNAROUND_BACK.png' },
]
