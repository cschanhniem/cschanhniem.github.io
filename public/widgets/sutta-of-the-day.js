(function () {
  const script = document.currentScript
  const src = script ? script.src : ''
  const basePath = src.replace(/\/widgets\/sutta-of-the-day\.js$/, '')
  const dataUrl = (script && script.dataset && script.dataset.index)
    ? script.dataset.index
    : `${basePath}/data/suttacentral-json/nikaya_index.json`
  const linkBase = (script && script.dataset && script.dataset.linkBase)
    ? script.dataset.linkBase
    : basePath

  const containerId = (script && script.dataset && script.dataset.container) || 'nhapluu-sutta-widget'
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    document.body.appendChild(container)
  }

  const style = document.createElement('style')
  style.textContent = `
    .nhapluu-widget {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      border: 1px solid #e6e6e6;
      border-radius: 12px;
      padding: 16px;
      background: #fffaf3;
      color: #2f2f2f;
      max-width: 360px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.05);
    }
    .nhapluu-widget h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }
    .nhapluu-widget p {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #5b5b5b;
    }
    .nhapluu-widget a {
      color: #b8884f;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
  `
  document.head.appendChild(style)

  function getDayIndex() {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    return Math.floor((now.getTime() - start.getTime()) / 86400000)
  }

  fetch(dataUrl)
    .then(res => res.json())
    .then(items => {
      const index = getDayIndex() % items.length
      const item = items[index]
      const title = item.title || item.paliTitle || item.id.toUpperCase()
      const code = item.id.toUpperCase()

      container.innerHTML = `
        <div class="nhapluu-widget">
          <h3>Sutta of the Day</h3>
          <p>${code} • ${title}</p>
          <a href="${linkBase}/nikaya/${item.id}" target="_blank" rel="noreferrer">Read on NhapLuu →</a>
        </div>
      `
    })
    .catch(() => {
      container.innerHTML = '<div class="nhapluu-widget">Unable to load Sutta of the Day.</div>'
    })
})()
