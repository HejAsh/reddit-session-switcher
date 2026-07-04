// popup.js – manage saved Reddit accounts

let accounts = [];
let currentUser = '';

function renderAccounts() {
  const list = document.getElementById('accountList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  if (!accounts.length) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  accounts.forEach(acc => {
    const isActive = currentUser && (acc.username === currentUser || acc.label === currentUser);
    const li = document.createElement('li');
    if (isActive) li.classList.add('active');

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = acc.label || acc.username || acc.id;
    name.title = 'Click to rename';
    name.onclick = () => {
      const newLabel = prompt('Rename account:', acc.label || acc.username || '');
      if (newLabel) {
        chrome.runtime.sendMessage({ action: 'renameAccount', id: acc.id, label: newLabel }, loadAccounts);
      }
    };
    li.appendChild(name);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const switchBtn = document.createElement('button');
    switchBtn.className = 'btn btn-small btn-switch';
    switchBtn.textContent = 'Switch';
    switchBtn.onclick = () => {
      chrome.runtime.sendMessage({ action: 'switchAccount', id: acc.id }, () => loadAccounts());
    };
    actions.appendChild(switchBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-small btn-delete';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => {
      chrome.runtime.sendMessage({ action: 'deleteAccount', id: acc.id }, loadAccounts);
    };
    actions.appendChild(delBtn);

    li.appendChild(actions);
    list.appendChild(li);
  });
}

function loadAccounts() {
  chrome.runtime.sendMessage({ action: 'getCurrentUser' }, resp => {
    currentUser = resp && resp.username ? resp.username : '';
    chrome.runtime.sendMessage({ action: 'getAccounts' }, result => {
      accounts = result || [];
      renderAccounts();
    });
  });
}

document.getElementById('captureBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'addAccount' }, loadAccounts);
});

loadAccounts();
