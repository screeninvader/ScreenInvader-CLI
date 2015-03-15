#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var http = require('http');
var validUrl = require('valid-url');
var promptly = require('promptly');

/**
 * Set ScreenInvader url
 */

var screeninvader = "http://10.20.30.40";

/**
 * Sanity checks for input values
 */

function verifyPosInt(val) {
  if (val >= 0) {
    return val;
  } else {
    console.warn("only values bigger than 0");
    return false;
  }
}

function verifyPercentage(val) {
  if (val <= 100 & val >= 0) {
    return val;
  } else {
    console.warn("only values between 0 and 100");
    return false;
  }
}

function verifyUrl(val) {
  if (validUrl.isUri(val)){
    return val;
  } else {
    console.warn("enter a URL");
    return false;
  }
}

/**
 * HTTP requests to trigger ScreenInvader actions
 */

function invade(cmd, val) {
  var command = "none";
  if (cmd === "add") command = screeninvader + "/cgi-bin/show?" + val;
  if (cmd === "volume") command = screeninvader + "/cgi-bin/set?/sound/volume=" + val;
  if (cmd === "jump") command = screeninvader + "/cgi-bin/playlist_jump?" + val;
  if (cmd === "remove") command = screeninvader + "/cgi-bin/playlist_remove?" + val;
  if (cmd === "list") command = screeninvader + "/cgi-bin/get?/playlist/.";
  if (cmd === "play") command = screeninvader + "/cgi-bin/trigger?playerPause";
  if (cmd === "next") command = screeninvader + "/cgi-bin/trigger?playerNext";
  if (cmd === "previous") command = screeninvader + "/cgi-bin/trigger?playerPrevious";

  http.get(command, function(res) {
    if (cmd === "list") {
      var body = "";

      res.on('data', function (chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var playlist = JSON.parse(body);
        for (var i in playlist.items) {
          console.log(i + " " + playlist.items[i].title);
        }
      });

      return true;
    } else if (val) {
      console.log(cmd + " " + val);
      return true;
    } else {
      console.log(cmd);
      return true;
    }
  }).on('error', function(e) {
    console.error("Got error: " + e.message);
    return false;
  });
}

program
  .version('0.0.1')
  .description('Remote CLI for the ScreenInvader')
  .option('-a, --add <url>', 'Add item to ScreenInvader', verifyUrl)
  .option('-s, --search <search term>', 'Search on Youtube')
  .option('-v, --volume <0>..<100>', 'Set ScreenInvader volume', verifyPercentage)
  .option('-j, --jump <0>..<i>', 'Jump to specific item in playlist', verifyPosInt)
  .option('-r, --remove <0>..<i>', 'Remove specific item from playlist', verifyPosInt)
  .option('-l, --list', 'Shows current playlist')
  .option('-p, --play', 'Play/pause')
  .option('-n, --next', 'Jump forward one item on the playlist')
  .option('-P, --previous', 'Jump back one item on the playlist')
  .parse(process.argv);

if (program.add) invade("add", program.add);
if (program.volume) invade("volume", program.volume);
if (program.jump) invade("jump", program.jump);
if (program.remove) invade("remove", program.remove);
if (program.list) invade("list");
if (program.play) invade("play");
if (program.next) invade("next");
if (program.previous) invade("previous");

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
          console.warn("not a valid search item");
          return false;
        }
      });
    });
  });
}

