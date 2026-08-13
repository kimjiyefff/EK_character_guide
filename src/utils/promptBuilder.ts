import { useMemo } from 'react'
import {
  CHARACTERS,
  MAX_HEIGHT_UNITS,
  type CharacterRecord,
} from '../data/characters'
import {
  COMMON_CHANGEABLE,
  COMMON_FORBIDDEN,
  COMMON_KEEP,
  PURPOSE_PROMPTS,
  type PromptTabId,
} from '../data/content'

/** 단일 캐릭터 신체 비율 유지 */
export const COMMON_RATIO = [
  '전체 키를 100% 기준으로 해당 캐릭터의 신체 비율을 유지한다.',
  '첨부된 캐릭터 비율 가이드 이미지와 3D 마스터 이미지를 정확하게 유지한다.',
  '첨부된 정면·측면 비율 가이드를 우선 기준으로 사용한다.',
  '포즈와 카메라 각도가 변경되더라도 해당 캐릭터의 머리·몸·팔·다리 비율을 변경하지 않는다.',
]

/** 캐릭터 간 상대 키 (하파 = 기준 100%) */
export function buildRelativeSizePromptBlock(): string {
  const lines = CHARACTERS.map((c) => {
    const percent = Math.round((c.heightUnits / MAX_HEIGHT_UNITS) * 100)
    return `- ${c.name}: 하파 대비 ${c.heightUnits}/${MAX_HEIGHT_UNITS} (${percent}%)`
  })

  return `[캐릭터 상대 사이즈 기준]

- 하파의 키를 기준 키 100%로 둔다.
- 여러 캐릭터가 한 장면에 나올 때는 아래 상대 키 비율을 반드시 지킨다.
- 단독 생성 시에도 해당 캐릭터의 상대 키 감각을 유지하고, 다른 캐릭터처럼 키를 키우거나 줄이지 않는다.
- 첨부된 사이즈 비교(SIZE) 이미지가 있으면 그 키 관계를 최우선으로 따른다.
- 캐릭터끼리 키가 비슷해 보이거나, 작은 캐릭터가 하파와 비슷하게 커지지 않게 한다.
- 발 위치를 같은 지면 기준으로 맞추고, 키 차이만 머리 높이로 표현한다.
${lines.join('\n')}`
}

export function buildCommonPromptBlock(): string {
  return `[전체 공통사항]

[반드시 유지]
${COMMON_KEEP.map((v) => `- ${v}`).join('\n')}

[변경 가능]
${COMMON_CHANGEABLE.map((v) => `- ${v}`).join('\n')}

[변경 금지 조건]
${COMMON_FORBIDDEN.map((v) => `- ${v}`).join('\n')}

[캐릭터 비율 고정]
${COMMON_RATIO.map((v) => `- ${v}`).join('\n')}

${buildRelativeSizePromptBlock()}`
}

export function useBuiltPrompt(
  character: CharacterRecord,
  tab: PromptTabId,
  inputs: Record<string, string>,
) {
  return useMemo(() => {
    if (tab === 'common') {
      return {
        text: buildCommonPromptBlock(),
        tags: [
          '전체 공통',
          '반드시 유지',
          '변경 가능',
          '변경 금지 조건',
          '비율 고정',
          '상대 사이즈',
        ],
        requiredImages: [] as string[],
      }
    }

    const purpose = PURPOSE_PROMPTS.find((p) => p.id === tab)!
    const userLines = purpose.inputFields
      .map((field) => {
        const value = inputs[field.key]?.trim()
        return value ? `- ${field.label}: ${value}` : null
      })
      .filter(Boolean)

    const purposeForbidden =
      purpose.forbidden && purpose.forbidden.length > 0
        ? `\n\n[목적별 변경 금지]\n${purpose.forbidden.map((v) => `- ${v}`).join('\n')}`
        : ''

    const text = `[제작 목적 · ${purpose.id}]
${purpose.purpose}

${purpose.coreLine}

${purpose.rules.length ? `[목적별 지시]\n${purpose.rules.map((v) => `- ${v}`).join('\n')}` : ''}

[사용자 입력]
${userLines.length ? userLines.join('\n') : '- (입력 없음)'}

[출력 조건]
- ${inputs.output?.trim() || inputs.background?.trim() || inputs.ratio?.trim() || '요청된 출력 형식 유지'}${purposeForbidden}`

    return {
      text,
      tags: [`${character.name} · 목적`, ...purpose.tags],
      requiredImages: purpose.requiredImages,
    }
  }, [character, tab, inputs])
}
