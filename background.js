var folderId
var historyId

const folderTitle = 'bookmarkpage-bn4yaq'
const historyTitle = 'history-bn4yaq'

function currentTab() {
  return new Promise(r => chrome.tabs.query({currentWindow: true, active: true}, x => r(x)))
}

function addToBookmark(fid, title, url) {
  chrome.bookmarks.create(
	{parentId: fid, index: 0, title: title, url: url},
	bn => dedupBookmark(fid, bn.id, url)
  )
}

function dedupBookmark(fid, bid, url) {
  chrome.bookmarks.getChildren(fid, items => {
	for (let x of items) {
	  if (x.id !== bid && x.url === url) {
		chrome.bookmarks.remove(x.id)
	  }
	}
  })
}

function bookmarkTab() {
  chrome.tabs.query({currentWindow: true, active: true}, tabs => {
	let tab = tabs[0]
	if (!tab.url.startsWith('http')) {
	  return
	}

	addToBookmark(folderId, tab.title, tab.url)

	chrome.browserAction.setBadgeText({text: "★"})
	setTimeout(() => chrome.browserAction.setBadgeText({text: ""}), 1000)
  })
}

function initFolder() {
  chrome.bookmarks.create(
	{title: folderTitle},
	bn => {
	  folderId = bn.id
	  chrome.bookmarks.create(
		{title: historyTitle},
		bn2 => {
		  historyId = bn2.id
		}
	  )
	}
  )
}

function init() {
  chrome.bookmarks.search(
	{title: folderTitle},
	items => {
	  if (items.length == 0) {
		initFolder()
	  } else {
		if (items.length > 1) {
		  console.log(`found ${items.length} ${folderTitle}`)
		}
		folderId = items[0].id
		chrome.bookmarks.search(
		  {title: historyTitle},
		  items => {
			historyId = items[0].id
		  }
		)
	  }
	}
  )

  chrome.browserAction.onClicked.addListener(bookmarkTab)
}

function removeBookmark(id, title, url) {
  addToBookmark(historyId, title, url)
  chrome.bookmarks.remove(id)
}

init()
