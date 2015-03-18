# ScreenInvader-CLI
Remote CLI for the ScreenInvader

This is a remote CLI for the [ScreenInvader](https://github.com/screeninvader/ScreenInvader). It's written in Node and depends on [Commander.js](https://github.com/tj/commander.js), [valid-url](https://www.npmjs.com/package/valid-url) and [promptly](https://www.npmjs.com/package/promptly).

## Installation

`npm install -g invade`

## Usage

``` 
 $ invade -h

   Usage: invade [options]

   Remote CLI for the ScreenInvader

   Options:

     -h, --help               output usage information
     -V, --version            output the version number
     -a, --add <url>          Add item to ScreenInvader
     -v, --volume <0>..<100>  Set ScreenInvader volume
     -j, --jump <0>..<i>      Jump to specific item in playlist
     -r, --remove <0>..<i>    Remove specific item from playlist
     -l, --list               Shows current playlist
     -p, --play               Play/pause
     -n, --next               Jump forward one item on the playlist
     -P, --previous           Jump back one item on the playlist
```

