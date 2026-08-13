export type PromptTabId =
  | 'common'
  | '2d-to-3d'
  | 'pose'
  | 'scene'
  | 'expression'
  | 'video'

export const PROMPT_TABS: { id: PromptTabId; label: string }[] = [
  { id: 'common', label: '전체 공통사항' },
  { id: '2d-to-3d', label: '2D → 3D 변환' },
  { id: 'pose', label: '다른 포즈' },
  { id: 'scene', label: '새로운 장면' },
  { id: 'expression', label: '표정 변경' },
  { id: 'video', label: '영상 제작' },
]

export const COMMON_KEEP = [
  '캐릭터의 정체성',
  '원본 형태',
  '얼굴형',
  '머리 형태',
  '눈·코·입의 형태와 위치',
  '머리와 몸의 비율',
  '팔과 다리 길이',
  '전체 실루엣',
  '캐릭터 고유 색상',
  '의상',
  '액세서리',
  '캐릭터 고유 특징',
  '승인된 재질',
]

export const COMMON_CHANGEABLE = [
  '자연스러운 3D 볼륨',
  '형태에 필요한 최소한의 두께',
  '승인된 범위의 재질 표현',
  '자연스러운 조명과 그림자',
  '요청된 포즈, 표정, 장면',
]

export const COMMON_FORBIDDEN = [
  '캐릭터 재디자인',
  '얼굴 미화',
  '눈의 크기 및 위치 변경',
  '얼굴형 변경',
  '머리 크기 변경',
  '신체 비율 변경',
  '팔과 다리 길이 변경',
  '캐릭터 색상 변경',
  '의상 디자인 변경',
  '액세서리 삭제 및 추가',
  '원본에 없는 새로운 디테일 추가',
  '기존 고유 특징 삭제',
  '사실적인 사람이나 동물 형태로 변경',
]

export interface PurposePromptMeta {
  id: Exclude<PromptTabId, 'common'>
  purpose: string
  requiredImages: string[]
  coreLine: string
  rules: string[]
  forbidden?: string[]
  inputFields: { key: string; label: string; placeholder?: string }[]
  tags: string[]
}

export const PURPOSE_PROMPTS: PurposePromptMeta[] = [
  {
    id: '2d-to-3d',
    purpose: '2D 원본 캐릭터의 형태를 유지하면서 승인된 3D 스타일로 변환한다.',
    requiredImages: [
      '2D 정면 원본',
      '2D 측면 원본',
      '비율 가이드',
      '승인된 3D 스타일 참고 이미지',
    ],
    coreLine:
      '이 작업은 캐릭터를 새롭게 디자인하는 작업이 아니라 기존 2D 캐릭터를 승인된 3D 형태로 변환하는 작업이다.',
    rules: [
      '전신이 잘리지 않게 표현',
      '투명 배경 PNG 출력',
    ],
    tags: ['3D 스타일 적용', '투명 PNG'],
    inputFields: [
      { key: 'styleNote', label: '추가 스타일 지시 (선택)', placeholder: '예: 부드러운 매트 재질' },
      { key: 'output', label: '출력 조건', placeholder: '투명 배경 PNG, 전신' },
    ],
  },
  {
    id: 'pose',
    purpose: '승인된 3D 마스터 캐릭터의 형태를 유지하면서 포즈만 변경한다.',
    requiredImages: [
      '승인된 3D 마스터 정면',
      '승인된 3D 마스터 45도',
      '측면 이미지',
      '변경할 포즈 참고 이미지',
    ],
    coreLine: '첨부된 3D 마스터 캐릭터를 그대로 사용하고 포즈만 변경한다.',
    rules: [],
    tags: ['포즈 변경', '마스터 고정'],
    inputFields: [
      { key: 'pose', label: '포즈 설명', placeholder: '예: 손을 흔들며 서 있는 포즈' },
      { key: 'hands', label: '손동작', placeholder: '예: 오른손 들기' },
      { key: 'feet', label: '발 위치', placeholder: '예: 어깨너비로 서기' },
      { key: 'gaze', label: '시선 방향', placeholder: '예: 카메라 응시' },
      { key: 'camera', label: '카메라 각도', placeholder: '예: 아이레벨 정면' },
      { key: 'background', label: '출력 배경', placeholder: '예: 투명 / 단색' },
    ],
  },
  {
    id: 'scene',
    purpose: '승인된 캐릭터를 유지하면서 배경과 상황만 새롭게 제작한다.',
    requiredImages: [
      '승인된 3D 마스터 이미지',
      '캐릭터 정면 및 45도',
      '필요한 배경 참고 이미지',
    ],
    coreLine: '새로운 장면을 제작하되 배경과 상황만 변경하고 캐릭터는 승인된 마스터를 유지한다.',
    rules: [],
    tags: ['장면 제작', '캐릭터 고정'],
    inputFields: [
      { key: 'place', label: '장소', placeholder: '예: 숲속' },
      { key: 'time', label: '시간대', placeholder: '예: 오후' },
      { key: 'situation', label: '상황', placeholder: '예: 친구와 인사' },
      { key: 'bg', label: '배경 요소', placeholder: '예: 나무, 길' },
      { key: 'position', label: '캐릭터 위치', placeholder: '예: 화면 중앙' },
      { key: 'framing', label: '카메라 구도', placeholder: '예: 미디엄 샷' },
      { key: 'light', label: '조명', placeholder: '예: 부드러운 자연광' },
      { key: 'ratio', label: '출력 비율', placeholder: '예: 1:1 / 16:9' },
    ],
  },
  {
    id: 'expression',
    purpose: '캐릭터의 얼굴 구조를 유지하면서 표정만 변경한다.',
    requiredImages: ['승인된 3D 얼굴 정면', '기본 표정', '표정 참고 이미지'],
    coreLine:
      '얼굴형과 눈·코·입의 기본 크기 및 위치는 유지하고 눈썹, 눈꺼풀, 입 모양의 최소 변화만으로 표정을 표현한다.',
    rules: [],
    forbidden: [
      '표정 때문에 눈 크기가 변하는 것',
      '얼굴형이 달라지는 것',
      '입 위치가 이동하는 것',
      '새로운 주름이나 사실적인 피부 표현',
      '다른 연령대로 보이게 변경하는 것',
    ],
    tags: ['표정 변경', '얼굴 고정'],
    inputFields: [
      { key: 'expression', label: '표정', placeholder: '기본 / 기쁨 / 슬픔 / 놀람 / 화남 / 걱정 / 웃음 / 직접 입력' },
      { key: 'custom', label: '직접 입력 표정 (선택)', placeholder: '예: 살짝 당황한 표정' },
    ],
  },
  {
    id: 'video',
    purpose: '승인된 3D 캐릭터를 장면 전체에서 동일하게 유지한다.',
    requiredImages: [
      '승인된 3D 마스터 이미지',
      '영상 시작 프레임',
      '필요한 경우 영상 종료 프레임',
    ],
    coreLine:
      '영상의 시작부터 끝까지 동일한 캐릭터 디자인과 비율을 유지한다. 움직임 중 얼굴, 신체, 의상 및 액세서리가 변형되지 않도록 한다.',
    rules: [],
    forbidden: [
      '프레임마다 얼굴이 달라지는 현상',
      '손가락 개수 변화',
      '움직임 중 얼굴과 신체 왜곡',
      '장면 전환 후 다른 캐릭터처럼 보이는 현상',
    ],
    tags: ['영상 제작', '일관성 유지'],
    inputFields: [
      { key: 'motion', label: '동작', placeholder: '예: 천천히 걷기' },
      { key: 'expression', label: '표정', placeholder: '예: 기본 미소' },
      { key: 'duration', label: '영상 길이', placeholder: '예: 3초' },
      { key: 'cameraMove', label: '카메라 움직임', placeholder: '예: 고정 / 살짝 푸시인' },
      { key: 'start', label: '시작 구도', placeholder: '예: 전신 정면' },
      { key: 'end', label: '종료 구도', placeholder: '예: 전신 정면' },
      { key: 'background', label: '배경', placeholder: '예: 단색' },
      { key: 'scene', label: '장면 설명', placeholder: '예: 손을 흔들며 인사' },
    ],
  },
]

export const NAV_ITEMS = [
  { id: 'principles', label: '전체 목적 및 원칙', path: '/' },
  { id: 'character', label: '캐릭터 기준', path: '/character' },
  { id: 'prompt', label: '프롬프트', path: '/prompt' },
  // { id: 'qa', label: 'QA 검수 및 문제 해결', path: '/qa' },
] as const

export const FLOW_STEPS = [
  '제작할 캐릭터 선택',
  '캐릭터 기준 및 비율 확인',
  '필요한 기준 이미지 다운로드',
  '제작 목적에 맞는 프롬프트 복사',
  'AI 제작 시 기준 이미지 첨부',
  '제작 결과 QA 검수',
  '승인 후 최종 사용',
]

export const PRINCIPLES = [
  {
    title: '원본 기준',
    description:
      '디자인팀에서 제공한 2D 원본 이미지와 승인된 3D 마스터 이미지를 기준으로 사용한다.',
  },
  {
    title: '형태 유지',
    description:
      '얼굴, 신체 비율, 전체 실루엣, 색상, 의상, 액세서리를 임의로 변경하지 않는다.',
  },
  {
    title: '마스터 이미지 우선',
    description:
      '새로운 포즈, 표정, 장면 및 영상은 승인된 3D 마스터 이미지를 기준으로 제작한다.',
  },
  {
    title: '검수 후 사용',
    description:
      'AI로 생성한 결과라도 캐릭터 기준과 다르면 사용할 수 없으며 디자인팀 검수 후 최종 사용한다.',
  },
]
