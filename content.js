// content.js – floating account switcher on Reddit pages

const FLOATER_HTML = `
<div class="res-floater-belowNavbar" style="position:fixed;top:70px;right:10px;z-index:10000;">
  <ul class="res-floater-list" style="list-style:none;margin:0;padding:0;background:#fff;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
    <li style="order:9;">
      <a id="RESAccountSwitcherFloater" class="pageNavigator res-icon" href="#" title="Switch Account" style="display:block;padding:6px 10px;text-decoration:none;color:#333;">
        ▼ Accounts
      </a>
    </li>
  </ul>
</div>
`;

function createFloater() {
  if (document.getElementById('RESAccountSwitcherFloater')) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = FLOATER_HTML;
  document.body.appendChild(wrapper.firstElementChild);

  const floater = document.getElementById('RESAccountSwitcherFloater');
  const dropdown = document.createElement('ul');
  dropdown.id = 'RESAccountSwitcherDropdown';
  dropdown.style.cssText = 'display:none;list-style:none;margin:0;padding:0;background:#fff;border:1px solid #ccc;position:absolute;top:100%;right:0;min-width:150px;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
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
  if (++attempts > 10) clearInterval(interval);
}, 1000);
