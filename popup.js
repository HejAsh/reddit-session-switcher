// popup.js – manage saved Reddit accounts

let accounts = [];
let currentUser = '';
let dragId = null;

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
    if (!acc || typeof acc !== 'object') return;
    const isActive = currentUser && (acc.username === currentUser || acc.label === currentUser);
    const li = document.createElement('li');
    li.dataset.id = acc.id;
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
    li.draggable = true;
    li.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(acc.id));
      dragId = acc.id;
      li.classList.add('dragging');
      if (e.dataTransfer.setDragImage) {
        const ghost = li.cloneNode(true);
        ghost.style.position = 'absolute';
        ghost.style.top = '-1000px';
        ghost.style.opacity = '1';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => ghost.remove(), 0);
      }
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
      document.querySelectorAll('.account-list li').forEach(el => el.classList.remove('drag-over'));
    });
    list.appendChild(li);
  });

  list.ondragover = e => {
    e.preventDefault();
    const after = getDragAfterElement(list, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (!dragging) return;
    if (after == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, after);
    }
    document.querySelectorAll('.account-list li').forEach(el => el.classList.remove('drag-over'));
    if (after) after.classList.add('drag-over');
  };

  list.ondrop = e => {
    e.preventDefault();
    const ids = [...list.querySelectorAll('.account-list li')].map(li => Number(li.dataset.id));
    const byId = Object.fromEntries(accounts.map(a => [a.id, a]));
    const ordered = ids.map(id => byId[id]).filter(Boolean);
    chrome.runtime.sendMessage({ action: 'reorderAccounts', order: ordered }, () => { });
  };
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.account-list li:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
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
