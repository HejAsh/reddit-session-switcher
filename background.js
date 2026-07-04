// background.js – cookie/session based Reddit account switching

function getAllAccounts(cb) {
  chrome.storage.local.get({ accounts: [] }, data => cb(data.accounts));
}
function setAllAccounts(accounts, cb) {
  chrome.storage.local.set({ accounts }, () => cb && cb());
}
function addAccount({ username, label, cookies }, cb) {
  getAllAccounts(accs => {
    const id = Date.now();
    const finalLabel = label || username || `Account ${accs.length + 1}`;
    accs.push({ id, username, label: finalLabel, cookies });
    setAllAccounts(accs, err => cb && cb(err));
  });
}
function deleteAccount(id, cb) {
  getAllAccounts(accs => {
    setAllAccounts(accs.filter(a => a.id !== id), cb);
  });
}
function renameAccount(id, newLabel, cb) {
  getAllAccounts(accs => {
    const acc = accs.find(a => a.id === id);
    if (acc) acc.label = newLabel;
    setAllAccounts(accs, cb);
  });
}

function getRedditCookies(cb) {
  chrome.cookies.getAll({ domain: 'reddit.com' }, cookies => {
    cb(cookies || []);
  });
}

function removeRedditCookies(cb) {
  getRedditCookies(cookies => {
    let pending = cookies.length;
    if (!pending) { cb && cb(); return; }
    cookies.forEach(c => {
      const url = `${c.secure ? 'https' : 'http'}://${c.domain.replace(/^\./, '')}${c.path}`;
      chrome.cookies.remove({ url, name: c.name }, () => {
        if (--pending === 0) cb && cb();
      });
    });
  });
}

function setRedditCookies(cookies, cb) {
  let pending = cookies.length;
  if (!pending) { cb && cb(); return; }
  cookies.forEach(c => {
    const url = `${c.secure ? 'https' : 'http'}://${c.domain.replace(/^\./, '')}${c.path}`;
    chrome.cookies.set({
      url,
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      expirationDate: c.expirationDate
    }, () => {
      if (--pending === 0) cb && cb();
    });
  });
}

function switchToAccount(id, cb) {
  getAllAccounts(accs => {
    const acc = accs.find(a => a.id === id);
    if (!acc) { cb && cb(new Error('account not found')); return; }
    removeRedditCookies(() => {
      setRedditCookies(acc.cookies, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          if (tabs.length && tabs[0].url && tabs[0].url.includes('reddit.com')) {
            chrome.tabs.reload(tabs[0].id);
          } else {
            chrome.tabs.create({ url: 'https://www.reddit.com' });
          }
          cb && cb();
        });
      });
    });
  });
}

function getCurrentUsername(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    if (!tabs.length || !tabs[0].url || !tabs[0].url.includes('reddit.com')) {
      cb && cb('');
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const el = document.querySelector('a[data-click-id="user"]');
        return el ? el.textContent.replace(/^u\//, '') : '';
      }
    }, results => {
      const username = (results && results[0] && results[0].result) || '';
      cb && cb(username);
    });
  });
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.action === 'getAccounts') {
    getAllAccounts(respond);
    return true;
  }
  if (msg.action === 'addAccount') {
    getCurrentUsername(username => {
      const label = msg.account && (msg.account.label || msg.account.username || username);
      getRedditCookies(cookies => {
        addAccount({ username, label, cookies }, () => getAllAccounts(respond));
      });
    });
    return true;
  }
  if (msg.action === 'addManualAccount') {
    const { username, label } = msg.account || {};
    getRedditCookies(cookies => {
      addAccount({ username, label, cookies }, () => getAllAccounts(respond));
    });
    return true;
  }
  if (msg.action === 'deleteAccount') {
    deleteAccount(msg.id, () => getAllAccounts(respond));
    return true;
  }
  if (msg.action === 'renameAccount') {
    renameAccount(msg.id, msg.label, () => getAllAccounts(respond));
    return true;
  }
  if (msg.action === 'switchAccount') {
    switchToAccount(msg.id, () => getAllAccounts(respond));
    return true;
  }
  if (msg.action === 'getCurrentUser') {
    getCurrentUsername(username => respond({ username }));
    return true;
  }
  return false;
});
