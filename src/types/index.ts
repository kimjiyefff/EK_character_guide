export type TaskId =
  | '2d-to-3d'
  | 'pose'
  | 'scene'
  | 'expression'
  | 'video'

export type WorkStep = 1 | 2 | 3 | 4 | 5

export interface TaskType {
  id: TaskId
  title: string
  description: string
  icon: 'cube' | 'pose' | 'scene' | 'face' | 'video'
}

export interface ChecklistItem {
  id: string
  label: string
  required?: boolean
}

export interface PromptSection {
  title: string
  items: string[]
}

export interface PromptContent {
  intro: string[]
  sections: PromptSection[]
  raw: string
}

export interface ProblemType {
  id: string
  title: string
  steps: { label: string; content: string }[]
  fallback: string
}

export interface MethodCard {
  id: string
  title: string
  usage: string
}

export interface QaItem {
  id: string
  label: string
}
