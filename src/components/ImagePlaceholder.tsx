interface Props {
  label?: string
  wide?: boolean
}

export function ImagePlaceholder({ label = '이미지 영역', wide }: Props) {
  return (
    <div className={`placeholder${wide ? ' wide' : ''}`} aria-label={label}>
      {label}
    </div>
  )
}
