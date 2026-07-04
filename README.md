# reddit-session-switcher

Switch between multiple Reddit accounts with one click by swapping session cookies. A minimal, privacy-focused Chrome extension.

## Features

- **Capture current account** – Save the active Reddit session while you are logged in.
- **One-click switching** – Swap sessions instantly from the popup or the floating dropdown on Reddit pages.
- **Rename accounts** – Click any account name in the popup to give it a custom label.
- **Delete accounts** – Remove saved sessions you no longer need.
- **No passwords stored** – Only session cookies already held by the browser are captured and stored locally.

## How to use

1. Log into a Reddit account normally on [reddit.com](https://www.reddit.com).
2. Click the extension icon in the toolbar and select **Capture Current Account**.
3. Log into another Reddit account in the same browser and capture it too.
4. Click **Switch** next to any saved account to swap sessions. The active Reddit tab will reload.
5. Click an account name to rename it, or click **Delete** to remove it.

You can also use the floating **▼ Accounts** dropdown that appears on Reddit pages.

## Install on Chrome or compatible browsers

This extension is built for **Manifest V3** and works in Chromium-based browsers such as Google Chrome, Microsoft Edge, Brave, Opera, and Vivaldi.

### From source (developer mode)

1. Download or clone this repository.
2. Open your browser and go to the extensions page:
   - **Chrome:** `chrome://extensions/`
   - **Edge:** `edge://extensions/`
   - **Brave:** `brave://extensions/`
   - **Opera:** `opera://extensions/`
   - **Vivaldi:** `vivaldi://extensions/`
3. Enable **Developer mode** (usually a toggle in the top-right corner).
4. Click **Load unpacked** and select the extension folder.
5. The extension icon will appear in the toolbar. Pin it for easy access.

### From the Chrome Web Store (coming soon)

Once published, you can install the extension directly from the Chrome Web Store.

## Permissions

- `cookies` – Read and write Reddit session cookies.
- `storage` – Save captured accounts locally.
- `scripting` – Detect the logged-in username from the Reddit page.
- `activeTab` / `tabs` – Reload the active Reddit tab after switching.
- `host_permissions` for `*://*.reddit.com/*` – The extension only operates on Reddit.

## Privacy

This extension does not collect, transmit, or share any personal data. All Reddit session cookies are stored only in the browser's local storage (`chrome.storage.local`). Users can delete saved accounts at any time from the popup.

See [PRIVACY.md](./PRIVACY.md) for the full privacy policy.

## Limitations

- Session cookies can expire. If an account stops working, log into Reddit again and re-capture the account.
- The extension works best on `www.reddit.com` and `old.reddit.com`. New Reddit layouts may use additional tokens that are harder to swap.
- Stored sessions are not encrypted. Avoid using this extension on shared computers.

## License

[MIT](./LICENSE)
