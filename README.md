# AI 2D → 3D 캐릭터 제작 가이드

사내 표준 가이드 웹사이트입니다.

## 실행

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 캐릭터 데이터 추가/수정

파일 위치: `src/data/characters.ts`

- 새 캐릭터 객체를 `CHARACTERS` 배열에 추가합니다.
- `ratio.measurements`에 비율값을 입력합니다. (`value: "28%"` 형태)
- `fixedFeatures`, `colors`, `images`, `promptIdentity`를 함께 작성합니다.

## 기준 이미지 교체

1. 이미지 파일을 `public/characters/{캐릭터id}/`에 넣습니다.
   - 예: `public/characters/tipa/ORIGINAL.png`
   - 예: `public/characters/tipa/MASTER_3D.png`
2. `src/data/characters.ts`의 해당 `images[].fileUrl`, `fileName`, `version`, `updatedAt`, `approvalStatus`를 수정합니다.

## 비율값 입력

`src/data/characters.ts` → 캐릭터 → `ratio.measurements`에서

- `value: null` → 화면에 `입력 필요`, 프롬프트에는 대체 문구
- `value: "32%"` → 표와 프롬프트에 수치 반영
- `status`를 `확정` / `측정 필요` 등으로 설정

## 메뉴 구조

1. 전체 목적 및 원칙 (`/`)
2. 캐릭터 기준 (`/character`)
3. 프롬프트 (`/prompt`)
4. QA 검수 및 문제 해결 (`/qa`)
