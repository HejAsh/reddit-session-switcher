# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1] - 2026-07-17

### Added
- Compact floating switcher that defaults to a minimal `▼` icon only (no text label).
- Drag-to-reorder saved accounts in the popup; the new order is persisted locally.

### Fixed
- Floating switcher no longer covers the Reddit Enhancement Suite (RES) account switcher (lowered z-index and repositioned).
- Switch no longer crashes on accounts with no saved session cookies.

## [1.0] - 2024-00-00

### Added
- Initial release: save and switch between multiple Reddit sessions.
- Rename and delete saved accounts.
- Floating account switcher on Reddit pages.
