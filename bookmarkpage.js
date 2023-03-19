let bg

chrome.runtime.getBackgroundPage(x => {
  bg = x
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
  let title = a.innerText.trim()
  bg.removeBookmark(id, title, url)
  li.parentElement.removeChild(li)
}

function selectLink(ev) {
  let el = ev.target
  let url = el.href
  let title = el.innerText.trim()
  bg.addToBookmark(bg.folderId, title, url)
}

function renderPage(bns) {
  let cols = [document.querySelector('#left-ul'), document.querySelector('#right-ul')]
  let d = 0
  for (let bn of bns) {
	let bid = `b-${bn.id}`
	let rid = `r-${bn.id}`
	let title = bn.title
	let url = bn.url
	let icon = guessFavIcon(url)
	let li = document.createElement('li')
	li.innerHTML = `<a id="${bid}" href="${url}"><img class="favicon" src="${icon}"> ${title}</a><span class="remove-btn" id="${rid}">×</span>`
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
