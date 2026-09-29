/** Shared document setup for the catalog and its isolated app preview. */
export function initializeDocumentStyles(preview: boolean) {
  document.documentElement.className =
    'h-full [color-scheme:light_dark] data-[theme=light]:[color-scheme:light] data-[theme=dark]:[color-scheme:dark]'
  document.documentElement.dataset.previewRuntime = String(preview)
  document.body.className =
    "m-0 min-h-0 [color-scheme:inherit] in-data-[theme=light]:[color-scheme:light] in-data-[theme=dark]:[color-scheme:dark] [font-family:Geist,'Noto_Sans_JP',sans-serif] text-[14px] text-foreground bg-(--ui-canvas) [&_#root]:h-full [&_#root]:min-h-0 [&_[data-dir-app-content='1']]:h-[calc(100dvh-var(--dir-app-shell-height,48px))] [&_[data-dir-app-content='1']]:overflow-auto [&_[data-dir-app-content='1']]:[scrollbar-gutter:stable] [&_#preview]:scroll-mt-20 [&_#api]:scroll-mt-20"
  if (preview) {
    document.body.className +=
      ' h-full w-full overflow-hidden [--dir-app-shell-height:0px] [&_#screen-root]:isolate [&_#screen-root]:h-full [&_#screen-root]:w-full [&_#screen-root]:min-h-0'
  }
}
