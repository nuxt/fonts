declare module 'microlighter' {
  export function highlightAll(options?: {
    root?: ParentNode
    selector?: string
    languageAliases?: Record<string, string>
  }): Promise<HTMLElement[]>
}
