import { assetUrl } from '../utils/assetUrl'

/**
 * 캐릭터 공식 기준 데이터
 *
 * [이미지 교체]
 * public/characters/{id}/ 에 파일 추가 후 아래 images.fileUrl 수정
 *
 * [비율값 입력]
 * ratio.measurements[].value 에 "28%" 형태 입력 (null 이면 입력 필요)
 */

export type CharacterId = 'tipa' | 'kini' | 'pani' | 'huni' | 'hapa'

export type ImageCategory = 'original2D' | 'master3D' | 'details'
export type ApprovalStatus = '확정' | '승인됨' | '준비중' | '측정 필요'

export interface RatioMeasurement {
  key: string
  label: string
  value: string | null
  tolerance: string
  status: ApprovalStatus
}

export interface ColorChip {
  part: string
  hex: string
  rgb: string
}

export interface CharacterImageAsset {
  id: string
  category: ImageCategory
  name: string
  description: string
  fileUrl: string | null
  fileName: string
  format: string
  sizeLabel: string
  version: string
  approvalStatus: ApprovalStatus
  updatedAt: string
}

export interface CharacterRecord {
  id: CharacterId
  name: string
  available: boolean
  subtitle: string
  /** 사이즈 비교 기준 (하파 = 5) */
  heightUnits: number
  color: string
  sizeThumbUrl: string | null
  thumbUrl: string | null
  zipUrl: string | null
  ratio: {
    note: string
    measurements: RatioMeasurement[]
  }
  fixedFeatures: {
    face: string[]
    body: string[]
    outfit: string[]
    accessories: string[]
    unique: string[]
  }
  /** 성격 및 역할 */
  personality: string[]
  colors: ColorChip[]
  images: CharacterImageAsset[]
  promptIdentity: string[]
}

export const MAX_HEIGHT_UNITS = 5

export const SIZE_GUIDELINES = [
  '캐릭터를 사용하실 때는 항상 정비례로 크기를 조절하여 사용해 주십시오. (외곽 라인의 두께도 비례하도록 사용해 주십시오.)',
  '캐릭터의 얼굴부분이 다른 어떠한 요소로도 가려져서는 안됩니다.',
  '이미지는 원본 그대로 사용하셔야 합니다.',
]

const RATIO_KEYS: { key: string; label: string }[] = [
  { key: 'totalHeight', label: '전체 키' },
  { key: 'headHeight', label: '머리 높이' },
  { key: 'faceWidth', label: '얼굴 너비' },
  { key: 'bodyHeight', label: '몸통 높이' },
  { key: 'bodyWidth', label: '몸통 너비' },
  { key: 'armLength', label: '팔 길이' },
  { key: 'legLength', label: '다리 길이' },
  { key: 'handSize', label: '손 크기' },
  { key: 'footSize', label: '발 크기' },
  { key: 'eyeSize', label: '눈 크기' },
  { key: 'eyeSpacing', label: '눈 사이 간격' },
  { key: 'featurePositions', label: '눈·코·입의 위치' },
  { key: 'accessorySize', label: '주요 액세서리 크기' },
]

function buildRatio(): CharacterRecord['ratio'] {
  return {
    note: '캐릭터 비율은 프롬프트 문구만으로 정확하게 유지하기 어렵습니다. AI 제작 시 비율이 표시된 정면·측면 기준 이미지를 반드시 함께 첨부하세요.',
    measurements: RATIO_KEYS.map((item) => {
      const isTotal = item.key === 'totalHeight'
      return {
        key: item.key,
        label: item.label,
        value: isTotal ? '100%' : null,
        tolerance: isTotal ? '기준' : '±3%',
        status: (isTotal ? '확정' : '측정 필요') as ApprovalStatus,
      }
    }),
  }
}

function img(
  partial: Omit<CharacterImageAsset, 'format' | 'sizeLabel' | 'version' | 'approvalStatus' | 'updatedAt'> &
    Partial<Pick<CharacterImageAsset, 'format' | 'sizeLabel' | 'version' | 'approvalStatus' | 'updatedAt'>>,
): CharacterImageAsset {
  const hasFile = !!partial.fileUrl
  return {
    format: partial.format ?? 'PNG',
    sizeLabel: partial.sizeLabel ?? (hasFile ? '등록됨' : '-'),
    version: partial.version ?? (hasFile ? 'v01' : '-'),
    approvalStatus: partial.approvalStatus ?? (hasFile ? '승인됨' : '준비중'),
    updatedAt: partial.updatedAt ?? (hasFile ? '2026-08-10' : '-'),
    ...partial,
  }
}

function buildImagePack(
  id: CharacterId,
  prefix: string,
  known: {
    original?: string | null
    master?: string | null
    masterViews?: Partial<Record<'front' | 'left' | 'right' | 'back' | '45' | 'face' | 'pose', string | null>>
  },
): CharacterImageAsset[] {
  const o2d = [
    ['front', '정면', known.original ?? null],
    ['left', '좌측면', null],
    ['right', '우측면', null],
    ['back', '후면', null],
    ['45', '45도', null],
    ['face', '얼굴 확대', null],
    ['expression', '기본 표정', null],
  ] as const

  const m3d = [
    ['front', '정면', known.masterViews?.front ?? known.master ?? null],
    ['left', '좌측면', known.masterViews?.left ?? null],
    ['right', '우측면', known.masterViews?.right ?? null],
    ['back', '후면', known.masterViews?.back ?? null],
    ['45', '45도', known.masterViews?.['45'] ?? null],
    ['face', '얼굴 확대', known.masterViews?.face ?? null],
    ['pose', '기본 포즈', known.masterViews?.pose ?? known.master ?? null],
  ] as const

  const details = [
    ['color', '캐릭터 컬러'],
    ['outfit', '의상'],
    ['acc', '액세서리'],
    ['feature', '고유 특징'],
    ['silhouette', '전체 실루엣'],
    ['forbid', '금지 변형 예시'],
  ] as const

  return [
    ...o2d.map(([key, label, fileUrl]) =>
      img({
        id: `${id}-2d-${key}`,
        category: 'original2D',
        name: `2D 원본 ${label}`,
        description: label,
        fileUrl,
        fileName: `${prefix}_2D_${key.toUpperCase()}_v01.png`,
      }),
    ),
    ...m3d.map(([key, label, fileUrl]) =>
      img({
        id: `${id}-3d-${key}`,
        category: 'master3D',
        name: `3D 마스터 ${label}`,
        description: label,
        fileUrl,
        fileName: `${prefix}_3D_MASTER_${key.toUpperCase()}_v01.png`,
      }),
    ),
    ...details.map(([key, label]) =>
      img({
        id: `${id}-detail-${key}`,
        category: 'details',
        name: label,
        description: label,
        fileUrl: null,
        fileName: `${prefix}_${key.toUpperCase()}_v01.png`,
      }),
    ),
  ]
}

export const CHARACTERS: CharacterRecord[] = [
  {
    id: 'tipa',
    name: '티파',
    available: true,
    subtitle: '갈색 · 부족 패턴',
    heightUnits: 3.8,
    color: '#8B5A2B',
    sizeThumbUrl: assetUrl('/characters/tipa/SIZE_3D.png'),
    thumbUrl: assetUrl('/characters/tipa/ORIGINAL.png'),
    zipUrl: null,
    ratio: buildRatio(),
    fixedFeatures: {
      face: [
        '둥근 삼각형 얼굴형',
        '상단 세 갈래 머리 + 노란 리본',
        '큰 흰 눈과 검은 동공, 바깥쪽 속눈썹',
        '밝은 미소와 작은 이빨',
        '볼의 초록·분홍 포인트 마크',
      ],
      body: ['종형 실루엣', '짧은 팔·다리', '둥근 손·발', '하단 치마형 실루엣'],
      outfit: ['초록/빨강/노란 레이어 치마', '노란 지그재그 무늬', '노란 스캘럽 밑단', '의상 구조 변경 금지'],
      accessories: ['머리 위 노란 리본 — 위치·크기·색상 유지'],
      unique: ['종형 갈색 실루엣', '노란 리본', '볼 포인트 마크', '치마 지그재그 패턴'],
    },
    colors: [
      { part: '바디', hex: '#8B5A2B', rgb: '139, 90, 43' },
      { part: '리본/밑단', hex: '#F5C518', rgb: '245, 197, 24' },
      { part: '치마 레드', hex: '#D94B3D', rgb: '217, 75, 61' },
      { part: '치마 그린', hex: '#3FA34D', rgb: '63, 163, 77' },
    ],
    images: buildImagePack('tipa', 'TIPA', {
      original: assetUrl('/characters/tipa/ORIGINAL.png'),
      master: assetUrl('/characters/tipa/MASTER_3D.png'),
    }),
    personality: [],
    promptIdentity: [
      '티파의 종형 갈색 실루엣을 유지한다.',
      '머리 위 노란 리본과 볼 포인트 마크를 유지한다.',
      '치마의 초록/빨강/노란 레이어와 지그재그 무늬를 유지한다.',
    ],
  },
  {
    id: 'kini',
    name: '키니',
    available: true,
    subtitle: '핑크 · 노란 리본',
    heightUnits: 2.9,
    color: '#E85D75',
    sizeThumbUrl: assetUrl('/characters/kini/SIZE_3D.png'),
    thumbUrl: assetUrl('/characters/kini/ORIGINAL.png'),
    zipUrl: null,
    ratio: buildRatio(),
    fixedFeatures: {
      face: ['둥근 핑크 얼굴', '큰 흰 눈 + 속눈썹', '작은 미소', '노란 리본 헤어 포인트'],
      body: ['배 형태 둥근 실루엣', '짧은 팔·다리', '머리-몸 일체형'],
      outfit: ['노란 목 밴드/칼라', '기본 바디 컬러 유지'],
      accessories: ['머리 위 노란 리본 — 위치·색상 유지'],
      unique: ['핑크 바디', '노란 리본', '속눈썹 포인트'],
    },
    colors: [
      { part: '바디', hex: '#E85D75', rgb: '232, 93, 117' },
      { part: '리본/칼라', hex: '#F5C518', rgb: '245, 197, 24' },
      { part: '눈 흰자', hex: '#FFFFFF', rgb: '255, 255, 255' },
    ],
    images: buildImagePack('kini', 'KINI', {
      original: assetUrl('/characters/kini/ORIGINAL.png'),
      master: assetUrl('/characters/kini/MASTER_3D.png'),
    }),
    personality: [],
    promptIdentity: [
      '키니의 핑크 둥근 실루엣을 유지한다.',
      '머리 위 노란 리본과 노란 목 밴드를 유지한다.',
      '속눈썹이 있는 큰 눈 형태를 유지한다.',
    ],
  },
  {
    id: 'pani',
    name: '파니',
    available: true,
    subtitle: '블루 · 노란 멜빵',
    heightUnits: 2.9,
    color: '#3D7EA6',
    sizeThumbUrl: assetUrl('/characters/pani/SIZE_3D.png'),
    thumbUrl: assetUrl('/characters/pani/ORIGINAL.png'),
    zipUrl: null,
    ratio: buildRatio(),
    fixedFeatures: {
      face: ['길쭉한 타원형 블루 얼굴', '큰 흰 눈', '작은 미소', '상단 작은 머리 포인트'],
      body: ['콩/물방울형 실루엣', '짧은 팔·다리'],
      outfit: ['노란 멜빵/오버롤', '상단 주황 삼각형 무늬 밴드'],
      accessories: ['멜빵 스트랩 — 형태·색상 유지'],
      unique: ['블루 바디', '노란 멜빵', '주황 삼각형 패턴'],
    },
    colors: [
      { part: '바디', hex: '#3D7EA6', rgb: '61, 126, 166' },
      { part: '멜빵', hex: '#F5C518', rgb: '245, 197, 24' },
      { part: '삼각형 포인트', hex: '#E07A3D', rgb: '224, 122, 61' },
    ],
    images: buildImagePack('pani', 'PANI', {
      original: assetUrl('/characters/pani/ORIGINAL.png'),
      master: assetUrl('/characters/pani/MASTER_3D.png'),
    }),
    personality: [],
    promptIdentity: [
      '파니의 블루 타원형 실루엣을 유지한다.',
      '노란 멜빵과 주황 삼각형 무늬를 유지한다.',
    ],
  },
  {
    id: 'huni',
    name: '후니',
    available: true,
    subtitle: '옐로 · 유랑악단',
    heightUnits: 2.2,
    color: '#FDCE15',
    sizeThumbUrl: assetUrl('/characters/huni/SIZE_3D.png'),
    thumbUrl: assetUrl('/characters/huni/ORIGINAL.png'),
    zipUrl: null,
    ratio: buildRatio(),
    fixedFeatures: {
      face: [
        '큰 검은 코',
        '분홍색 볼',
        '앞니가 보이는 활짝 열린 입',
      ],
      body: [
        '작고 둥근 체형',
        '머리 양옆의 위로 휘어진 귀 모양 유지',
        '정수리의 작은 돌기 유지',
        '흰색 타원형 배 패치 유지',
      ],
      outfit: ['기본 의상 없음 — 바디/배 패치 유지'],
      accessories: ['심벌즈'],
      unique: [
        '후니는 유랑악단의 귀염둥이 악동',
        '작고 둥근 체형과 머리 양옆의 위로 휘어진 귀 모양 유지, 정수리의 작은 돌기를 유지한다.',
        '큰 검은 코, 분홍색 볼, 앞니가 보이는 활짝 열린 입과 흰색 타원형 배 패치를 유지한다.',
      ],
    },
    colors: [
      { part: '바디', hex: '#FDCE15', rgb: '253, 206, 21' },
      { part: '배 패치 / 눈 흰자 / 이빨', hex: '#FFFFFF', rgb: '255, 255, 255' },
      { part: '볼', hex: '#F2A7B8', rgb: '242, 167, 184' },
      { part: '눈동자 / 코', hex: '#1A1A1A', rgb: '26, 26, 26' },
      { part: '입 안', hex: '#E85A4F', rgb: '232, 90, 79' },
    ],
    images: buildImagePack('huni', 'HUNI', {
      original: assetUrl('/characters/huni/ORIGINAL.png'),
      master: assetUrl('/characters/huni/MASTER_3D.png'),
    }),
    personality: [
      '유랑악단의 귀염둥이 악동',
      '장난기 많고 활발한 분위기',
      '심벌즈를 신나고 멋지게 연주하는 캐릭터',
    ],
    promptIdentity: [
      '후니는 유랑악단의 귀염둥이 악동이다.',
      '작고 둥근 체형과 머리 양옆의 위로 휘어진 귀 모양, 정수리의 작은 돌기를 유지한다.',
      '큰 검은 코, 분홍색 볼, 앞니가 보이는 활짝 열린 입과 흰색 타원형 배 패치를 유지한다.',
      '바디 컬러는 #FDCE15를 유지한다.',
    ],
  },
  {
    id: 'hapa',
    name: '하파',
    available: true,
    subtitle: '화이트 · 최대 사이즈',
    heightUnits: 5,
    color: '#5B6B7A',
    sizeThumbUrl: assetUrl('/characters/hapa/SIZE_3D.png'),
    thumbUrl: assetUrl('/characters/hapa/ORIGINAL.png'),
    zipUrl: null,
    ratio: buildRatio(),
    fixedFeatures: {
      face: [
        '둥근 타원형 얼굴·몸 일체형',
        '상단 흰 소용돌이 헤어',
        '큰 검은 타원 눈',
        '연한 파란 삼각 코',
        '넓은 미소와 사각 앞니',
        '분홍 볼 블러셔',
      ],
      body: ['달걀형 전신', '짧은 둥근 팔·다리', '배의 연한 파란 원형 패치'],
      outfit: ['기본 의상 없음', '머리띠를 장식 요소로 유지'],
      accessories: ['파란 머리띠 + 주황 삼각형 패턴'],
      unique: ['흰 바디 + 파란 배 패치', '머리띠 패턴', '사각 앞니', '최대 사이즈'],
    },
    colors: [
      { part: '바디', hex: '#F5F5F5', rgb: '245, 245, 245' },
      { part: '배 패치/코', hex: '#7EB8D4', rgb: '126, 184, 212' },
      { part: '머리띠', hex: '#1F4B99', rgb: '31, 75, 153' },
      { part: '삼각형 포인트', hex: '#E07A3D', rgb: '224, 122, 61' },
    ],
    images: buildImagePack('hapa', 'HAPA', {
      original: assetUrl('/characters/hapa/ORIGINAL.png'),
      master: assetUrl('/characters/hapa/MASTER_3D.png'),
      masterViews: {
        '45': assetUrl('/characters/hapa/MASTER_3D_45.png'),
        front: assetUrl('/characters/hapa/MASTER_3D_FRONT.png'),
        back: assetUrl('/characters/hapa/MASTER_3D_BACK.png'),
        pose: assetUrl('/characters/hapa/MASTER_3D_FRONT.png'),
      },
    }),
    personality: [],
    promptIdentity: [
      '하파의 흰 달걀형 실루엣과 파란 배 패치를 유지한다.',
      '파란 머리띠와 주황 삼각형 패턴을 유지한다.',
      '두 개의 사각 앞니가 보이는 미소를 유지한다.',
    ],
  },
]

export const DEFAULT_CHARACTER_ID: CharacterId = 'tipa'

export function getCharacter(id: CharacterId): CharacterRecord {
  return CHARACTERS.find((c) => c.id === id && c.available) ?? CHARACTERS[0]
}

export function getSelectableCharacters(): CharacterRecord[] {
  return CHARACTERS.filter((c) => c.available)
}

export function hasMeasuredRatio(character: CharacterRecord): boolean {
  return character.ratio.measurements.some(
    (m) => m.key !== 'totalHeight' && m.value !== null,
  )
}

export function getImagesByCategory(
  character: CharacterRecord,
  category: ImageCategory,
): CharacterImageAsset[] {
  return character.images.filter((item) => item.category === category)
}
