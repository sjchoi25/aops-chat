# Changelog

## Version 1.1.0

### Added
- Added user limit
- Added check for zero width joiners in message and username
- Limited rooms to prevent spammers
- Mobile support
- Favicon

### Fixed
- Fixed break tag issue in chat
- Fixed missing space in minified HTML file
- Fixed history issue with tags showing
- Fixed bug where user can skip the enter screen and break the chat
- Fixed user list bug
- Fixed minor scroll issue with MathJax

## Version 1.2.0

### Changed
- File structure
- NEW UI!
- Button text
- Altered font
- Shift-enter = new line, enter = send
- Changed MathJax to katex
- Simplified js

### Fixed
- HTML injections with username
- Fixed broken HTML
- Slighly more readable CSS

### Added
- Added noscript stuff
- Limit to length of sticky
- Added popups
- Message + username length limit
- Simple BBCode "parser"

## Version 1.2.1

### Changed
- Slightly modified sticky bar, (no margin on bottom)
- Now detects urls
- Changed file structure
- Changed font
- Image functionality removed -- it likes to fight with the url detector
- Links open in new tab

### Fixed
- Load chat once Katex is loaded (can result in slight lag)

### Added
- Notifications
- You can now see the number of users in a room
- Username auto saves (once you join)
- Dark mode
