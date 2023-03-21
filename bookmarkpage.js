let bg

chrome.runtime.getBackgroundPage(x => {
  bg = x
  chrome.omnibox.onInputEntered.addListener(onOmniboxInputEntered)
  chrome.bookmarks.getChildren(bg.folderId, bns => renderPage(bns))
})

function removeLink(ev) {
  let el = ev.target
  let li = el.parentElement
  let rid = el.id
  let id = rid.substring(2)
  let bid = `b-${id}`
  let a = document.querySelector(`#${bid}`)
  let url = a.href
  let title = a.querySelector('.title').innerText
  bg.removeBookmark(id, title, url)
  li.parentElement.removeChild(li)
}

function selectLink(ev) {
  let el = ev.target.closest('a')
  let bid = el.id.substring(2)
  bg.touchBookmark(bid)
}

function renderPage(bns) {
  let cols = [document.querySelector('#left-ul'), document.querySelector('#right-ul')]
  let d = 0
  for (let i = 0; i < bns.length; i++) {
	let bn = bns[i];
	let url = bn.url
	if (!url) continue;
	let bi = azencode(i)
	let bid = `b-${bn.id}`
	let rid = `r-${bn.id}`
	// console.log(bn.title, bn.url)
	let title = bn.title
	let icon = guessFavIcon(url)
	let li = document.createElement('li')
	li.id = `i-${bi}`
	li.innerHTML = `
        <a id="${bid}" href="${url}">
            <img class="favicon" src="${icon}">
            <span class="title">${title}</span>
            <sup>${bi}</sup>
        </a>
        <span class="remove-btn" id="${rid}">×</span>
    `
	li.querySelector('img').onerror = ev => { ev.target.style.visibility = 'hidden'}
	li.querySelector('.remove-btn').onclick = removeLink
	li.querySelector('a').onclick = selectLink
	cols[d].appendChild(li)
	d = (d+1)%2
  }
}

function guessFavIcon(url) {
  let u = new URL(url)
  return `${u.protocol}//${u.host}/favicon.ico`
}

function onOmniboxInputEntered(text, disposition) {
  let bi = text.trim()
  let li = document.querySelector(`#i-${bi}`)
  if (li) {
	let a = li.querySelector('a')
	a.click()
  }
}

function azencode(i) {
  if (i === 0) {
	return 'a'
  }
  let s = ''
  while (i > 0) {
	let x = i % 26 + 10
	s = x.toString(36) + s
	i = Math.floor(i/26)
  }
  return s
}
