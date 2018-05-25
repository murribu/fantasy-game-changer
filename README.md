# Fantasy Game Changer

A Chrome Extension that helps you load your fantasy team(s) into the [MLB Game Changer](https://www.thebaseballgauge.com/GameChanger.php).

## Installation (for non-coders)
1. Download [this](https://s3.amazonaws.com/cory-personal-public/FantasyGameChanger.zip)
2. Unzip the files, and store them on your computer (take note of where you store them)
3. Launch [Chrome](https://www.google.com/chrome/)
4. At the top right of your Chrome browser, click the icon that looks like 3 vertical dots and then `More tools` and then `Extensions`.
5. Turn on Developer Mode (look in the top-right of the page)
6. Click on `Load Unpacked` (top-center)
7. Select the folder where you stored those files

## Installation (for coders)
1. `git clone https://github.com/murribu/fantasy-game-changer`
2. `npm run build`
3. Open up Chrome Extensions
4. Make sure Developer Mode is turned on
5. Click on `Load Unpacked`
6. Select the `build` folder from this repo

## Load in your fantasy teams
1. Visit your team's page on Yahoo or CBS (these are the only two supported sites, for now)
2. Click on the Chrome Extension
3. Click on "Add a Team From This Page"
4. Reload the page (maybe 2 or 3 times)
5. Visit [MLB Game Changer](https://www.thebaseballgauge.com/GameChanger.php)
6. You may need to reload the page a few times, but your roster should auto-populate

## Development Notes

I used [this repo](https://github.com/anthonygore/chrome-extension-webpack-boilerplate) as a starting point for this project.

For local development, run `npm run start` and then navigate to localhost:3000/popup.html - for hot reloading.

run `npm run build` to generate the Extension build files - which will be stored in the `build` folder.
