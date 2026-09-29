// Keep recovery independent of the application's module graph.
;(function () {
  function recover() {
    const root = document.getElementById('root')
    if (!root || root.childElementCount) return
    const panel = document.createElement('section')
    panel.setAttribute('role', 'alert')
    panel.className =
      'm-8 max-w-[600px] rounded-lg border border-zinc-300 bg-white p-6 font-sans text-sm leading-relaxed text-zinc-900'
    const title = document.createElement('h1')
    title.textContent = 'Unable to load the page'
    const description = document.createElement('p')
    description.textContent = 'The application failed to start. Please reload the page.'
    const button = document.createElement('button')
    button.textContent = 'Reload'
    button.className = 'cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900'
    button.onclick = function () {
      location.reload()
    }
    panel.append(title, description, button)
    root.replaceChildren(panel)
  }
  addEventListener('error', function (event) {
    if (event instanceof ErrorEvent || event.target instanceof HTMLScriptElement) recover()
  }, true)
  addEventListener('unhandledrejection', recover)
})()
