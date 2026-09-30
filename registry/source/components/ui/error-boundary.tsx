import '@/components/ui/dir-theme.css'
import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  override render() {
    if (!this.state.failed) return this.props.children
    return (
      <section
        role='alert'
        className='m-[24px] p-[24px] [border:1px_solid_var(--ui-border,#d4d4d8)] rounded-[8px] [font:14px/1.6_system-ui] [&_h2]:text-[18px] [&_h2]:font-semibold [&_button]:p-[8px_16px] [&_button]:m-[12px_0] [&_button]:[border:1px_solid_var(--ui-border,#d4d4d8)] [&_button]:rounded-[6px] [&_button]:cursor-pointer [&_details]:mt-[12px]'
      >
        <h2>Unable to display this page</h2>
        <p>A required file could not be loaded or the page failed to start.</p>
        <button type='button' onClick={() => location.reload()}>Reload</button>
        <details>
          <summary>If the problem continues</summary>
          <p>Share your browser name and the page URL.</p>
        </details>
      </section>
    )
  }
}
