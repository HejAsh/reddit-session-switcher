// content.js – floating account switcher on Reddit pages

const FLOATER_ID = 'RSSFloater';
const FLOATER_LINK_ID = 'RSSFloaterLink';

function getCompactMode(cb) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
    cb(false);
    return;
  }
  chrome.storage.sync.get({ compact: true }, data => cb(!!data.compact));
}

function buildFloaterHtml(compact) {
  const label = compact ? '▼' : '▼ Accounts';
  return `
<div id="${FLOATER_ID}" class="res-floater-belowNavbar" style="position:fixed;top:70px;right:10px;z-index:9;">
  <ul class="res-floater-list" style="list-style:none;margin:0;padding:0;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);${compact ? 'width:28px;' : ''}">
    <li style="order:9;">
      <a id="${FLOATER_LINK_ID}" class="pageNavigator res-icon" href="#" title="Switch Account" style="display:block;padding:${compact ? '6px 0' : '6px 10px'};text-decoration:none;color:#333;text-align:center;${compact ? 'font-size:14px;width:28px;' : ''}">
        ${label}
      </a>
    </li>
  </ul>
</div>
`;
}

function createFloater() {
  if (document.getElementById(FLOATER_ID)) return;
  getCompactMode(compact => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = buildFloaterHtml(compact);
    const floaterEl = wrapper.firstElementChild;
    document.body.appendChild(floaterEl);
    positionFloater(floaterEl);

    const floater = document.getElementById(FLOATER_LINK_ID);
    const dropdown = document.createElement('ul');
    dropdown.id = 'RESAccountSwitcherDropdown';
    dropdown.style.cssText = 'display:none;list-style:none;margin:0;padding:0;background:#fff;border:1px solid #ccc;position:absolute;top:100%;right:0;min-width:150px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10;';
    floater.parentElement.appendChild(dropdown);

    floater.addEventListener('click', e => {
      e.preventDefault();
      populateDropdown(dropdown);
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', e => {
      if (!floater.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  });
}

// Reposition the floater so it does not cover the RES account switcher,
// which RES renders inside the page header/navbar.
function positionFloater(floaterEl) {
  const resSwitcher = document.querySelector('#RESAccountSwitcherFloater, .RESAccountSwitcher, #RESSwitcher, .res-account-switcher');
  if (!resSwitcher) return;

  const rect = resSwitcher.getBoundingClientRect();
  if (!rect.width) return;

  // Place our floater just to the left of the RES switcher so both stay usable.
  floaterEl.style.top = rect.top + 'px';
  floaterEl.style.right = 'auto';
  floaterEl.style.left = Math.max(0, rect.left - floaterEl.offsetWidth - 8) + 'px';
}

function populateDropdown(dropdown) {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) return;
  dropdown.innerHTML = '';
  chrome.runtime.sendMessage({ action: 'getAccounts' }, accounts => {
    if (!accounts || !accounts.length) {
      const li = document.createElement('li');
      li.textContent = 'No accounts saved';
      li.style.cssText = 'padding:6px 10px;color:#666;';
      dropdown.appendChild(li);
      return;
    }
    accounts.forEach(acc => {
      const li = document.createElement('li');
      li.textContent = acc.label || acc.username || acc.id;
      li.style.cssText = 'padding:6px 10px;cursor:pointer;';
      li.addEventListener('mouseenter', () => li.style.background = '#f0f0f0');
      li.addEventListener('mouseleave', () => li.style.background = 'transparent');
      li.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'switchAccount', id: acc.id }, () => { });
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(li);
    });
  });
}

createFloater();
let attempts = 0;
const interval = setInterval(() => {
  createFloater();
  const floaterEl = document.getElementById(FLOATER_ID);
  if (floaterEl) positionFloater(floaterEl);
  if (++attempts > 10) clearInterval(interval);
}, 1000);

// Rebuild the floater when the compact setting changes so it updates live.
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.compact) {
      const existing = document.getElementById(FLOATER_ID);
      if (existing) existing.remove();
      createFloater();
    }
  });
}
