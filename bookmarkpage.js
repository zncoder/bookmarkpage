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
  let title = a.querySelector('.title').getAttribute('value')
  bg.removeBookmark(id, title, url)
  li.parentElement.removeChild(li)
}

function editLink(ev) {
  let el = ev.target
  let li = el.parentElement
  let a = li.querySelector('a')
  a.contentEditable = 'true'
  el.innerText = '✓'
  el.onclick = updateLink
}

function updateLink(ev) {
  let el = ev.target
  let li = el.parentElement
  let a = li.querySelector('a')
  let title = a.querySelector('.title').innerText
  let bid = a.id.substring(2)
  bg.updateBookmarkTitle(bid, title)
  el.innerText = '✍'
  el.onclick = editLink
}

function selectLink(ev) {
  let el = ev.target.closest('a')
  let bid = el.id.substring(2)
  bg.touchBookmark(bid)
}

function renderPage(bns) {
  if (document.querySelector('#single-ul')) {
	renderSingleColumn(bns)
  } else {
	renderTwoColumns(bns)
  }
}

function renderSingleColumn(bns) {
  let col = document.querySelector('#single-ul')
  for (let i = 0; i < bns.length; i++) {
	let bn = bns[i];
	let url = bn.url
	if (!url) continue;
	let bi = azencode(i)
	let bid = `b-${bn.id}`
	let eid = `e-${bn.id}`
	let rid = `r-${bn.id}`
	let title = bn.title
	let titleText = bn.title.length > 100 ? bn.title.slice(0, 100)+'...' : bn.title
	let icon = guessFavIcon(url)
	let li = document.createElement('li')
	li.id = `i-${bi}`
	li.classList.add('entry')
	li.innerHTML = `
        <a id="${bid}" href="${url}">
            <img class="favicon" src="${icon}">
            <span class="title" value="${title}">${titleText}</span>
        </a>
        &nbsp;&nbsp;&nbsp;&nbsp;<span class="edit-btn" id="${eid}">✍</span>&nbsp;&nbsp;<span class="remove-btn" id="${rid}">×</span>
    `
	li.querySelector('img').onerror = ev => { ev.target.style.visibility = 'hidden'}
	li.querySelector('.edit-btn').onclick = editLink
	li.querySelector('.remove-btn').onclick = removeLink
	li.querySelector('a').onclick = selectLink
	col.appendChild(li)
  }
}

function renderTwoColumns(bns) {
  let cols = [document.querySelector('#left-ul'), document.querySelector('#right-ul')]
  let d = 0
  for (let i = 0; i < bns.length; i++) {
	let bn = bns[i];
	let url = bn.url
	if (!url) continue;
	let bi = azencode(i)
	let bid = `b-${bn.id}`
	let eid = `e-${bn.id}`
	let rid = `r-${bn.id}`
	// console.log(bn.title, bn.url)
	let title = bn.title
	let titleText = bn.title.length > 64 ? bn.title.slice(0, 64)+'...' : bn.title
	let icon = guessFavIcon(url)
	let li = document.createElement('li')
	li.id = `i-${bi}`
	li.classList.add('entry')
	li.innerHTML = `
        <a id="${bid}" href="${url}">
            <img class="favicon" src="${icon}">
            <span class="title" value="${title}">${titleText}</span>
            <!-- <sup>${bi}</sup> -->
        </a>
        &nbsp;&nbsp;&nbsp;&nbsp;<span class="edit-btn" id="${eid}">✍</span>&nbsp;&nbsp;<span class="remove-btn" id="${rid}">×</span>
    `
	li.querySelector('img').onerror = ev => { ev.target.style.visibility = 'hidden'}
	li.querySelector('.edit-btn').onclick = editLink
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
  let bi = text.trim().toLowerCase()
  let li = document.querySelector(`#i-${bi}`)
  if (li) {
	let a = li.querySelector('a')
	a.click()
	return
  }

  // match titles
  let matched = []
  for (li of document.querySelectorAll('.entry')) {
	if (li.style.display === 'none') continue;
	let title = li.querySelector('.title')
	if (!title) continue;
	let s = title.getAttribute('value').toLowerCase()
	if (s.indexOf(bi) < 0) {
	  li.style.display = 'none'
	} else {
	  matched.push(li)
	}
  }
  // if only one title matches, jump to the link
  if (matched.length === 1) {
	matched[0].querySelector('a').click()
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
