#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var http = require('http');
var validUrl = require('valid-url');
var promptly = require('promptly');

/**
 * Set ScreenInvader/slackomatic url
 */

var screeninvader = "http://10.20.30.40";
var slackomatic = "http://10.20.30.90:8080";

/**
 * Sanity checks for input values
 */

function verifyPosInt(val) {
  if (val >= 0) {
    return val;
  } else {
    console.error("only values bigger than 0");
    return false;
  }
}

function verifyPercentage(val) {
  if (val <= 100 & val >= 0) {
    return val;
  } else {
    console.error("only values between 0 and 100");
    return false;
  }
}

function verifyLight(val) {
  if (val <= 4 & val >= 0) {
    return val;
  } else {
    console.error("only values between 0 and 4");
    return false;
  }
}

function verifyUrl(val) {
  if (validUrl.isUri(val)){
    return val;
  } else {
    console.error("enter a URL");
    return false;
  }
}

/**
 * HTTP requests to trigger ScreenInvader actions
 */

function invade(cmd, val) {
  var command = false;
  if (cmd === "add") command = screeninvader + "/cgi-bin/show?" + val;
  if (cmd === "volume" && val === true) {
    command = screeninvader + "/cgi-bin/get?/sound/volume";
  } else if (cmd === "volume") {
    command = screeninvader + "/cgi-bin/set?/sound/volume=" + val;
  }
  if (cmd === "jump") command = screeninvader + "/cgi-bin/playlist_jump?" + val;
  if (cmd === "remove") command = screeninvader + "/cgi-bin/playlist_remove?" + val;
  if (cmd === "list") command = screeninvader + "/cgi-bin/get?/playlist/.";
  if (cmd === "play") command = screeninvader + "/cgi-bin/trigger?playerPause";
  if (cmd === "next") command = screeninvader + "/cgi-bin/trigger?playerNext";
  if (cmd === "close") command = screeninvader + "/cgi-bin/trigger?browserClose";
  if (cmd === "previous") command = screeninvader + "/cgi-bin/trigger?playerPrevious";
  if (cmd === "current") command = screeninvader + "/cgi-bin/get?/playlist/index";
  if (cmd === "light") {
    switch (val) {
      case "0":
        command = slackomatic + "/slackomatic/rooms/lounge/lighting/off";
        break;
      case "1":
        command = slackomatic + "/slackomatic/rooms/lounge/lighting/super_chillig";
        break;
      case "2":
        command = slackomatic + "/slackomatic/rooms/lounge/lighting/chillig";
        break;
      case "3":
        command = slackomatic + "/slackomatic/rooms/lounge/lighting/normal";
        break;
      case "4":
        command = slackomatic + "/slackomatic/rooms/lounge/lighting/chinese_sweatshop";
        break;
    }
  }

  http.request(command, function(res) {
    var body = "";

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function() {
      if (cmd === "list") {
        var playlist = JSON.parse(body);
        for (var i in playlist.items) {
          console.log(i + " " + playlist.items[i].title);
        }
      } else if (cmd === "current") {
        var result = JSON.parse(body);
        console.log("currently played item: " + result.playlist.index);
      } else if (cmd === "volume" && val === true) {
        var result = JSON.parse(body);
        console.log("current volume: " + result.sound.volume)
      } else if (val) {
        console.log(cmd + " " + val);
      } else {
        console.log(cmd);
      }
    });
  }).on('error', function(e) {
    console.error("Got error: " + e.message);
  }).end();
}

program
  .version('0.0.5')
  .description('Remote CLI for the ScreenInvader')
  .option('-a, --add <url>', 'Add item to ScreenInvader', verifyUrl)
  .option('-s, --search <search term>', 'Search on Youtube')
  .option('-v, --volume [0]..[100]', 'Set/Get ScreenInvader volume', verifyPercentage)
  .option('-j, --jump <0>..<i>', 'Jump to specific item in playlist', verifyPosInt)
  .option('-r, --remove <0>..<i>', 'Remove specific item from playlist', verifyPosInt)
  .option('-L, --light <0>..<4>', 'Set lighting via slackomatic', verifyLight)
  .option('-l, --list', 'Shows current playlist')
  .option('-p, --play', 'Play/pause')
  .option('-n, --next', 'Jump forward one item on the playlist')
  .option('-P, --previous', 'Jump back one item on the playlist')
  .option('-c, --close', 'Close browser/overlayed pictures')
  .option('-C, --current', 'Get id of the currently played item')
  .parse(process.argv);

if (program.add) invade("add", program.add);
if (program.volume) invade("volume", program.volume);
if (program.jump) invade("jump", program.jump);
if (program.remove) invade("remove", program.remove);
if (program.light) invade("light", program.light);
if (program.list) invade("list");
if (program.play) invade("play");
if (program.next) invade("next");
if (program.previous) invade("previous");
if (program.current) invade("current");
if (program.close) invade("close");

if (program.search) {
  var j = 0;
  http.get("http://gdata.youtube.com/feeds/api/videos?alt=json&max-results=8&q="+program.search+"&type=video", function(res) {
    var body = "";

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function() {
      var query = JSON.parse(body);
      for (var i in query.feed.entry) {
        console.log(i + " " + query.feed.entry[i].title.$t);
        j = i;
      }
      promptly.prompt('Enter number between 0 and ' + j + ': ', function (err, value) {
        if (value <= j && value >= 0) {
          console.log("add " + query.feed.entry[value].title.$t);
          invade("add", query.feed.entry[value].link[0].href);
        } else {
          console.error("not a valid search item");
          return false;
        }
      });
    });
  });
}

