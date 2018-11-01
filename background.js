// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({
		state : "on"
	}, function() {
		console.log('Current grouping type: alphabetical');
	});
});

chrome.tabs.onHighlighted.addListener(moveTab);
chrome.tabs.onUpdated.addListener(moveTab);
chrome.tabs.onCreated.addListener(moveTab);
chrome.tabs.onMoved.addListener(moveTab);
chrome.tabs.onAttached.addListener(moveTab);
chrome.tabs.onReplaced.addListener(moveTab);
chrome.browserAction.onClicked.addListener(updateIcon);

function updateIcon() {
	console.log("clicked");
	chrome.storage.sync.get('state', function(data) {
		var state = data.state;
		if (state == "on") {
			chrome.browserAction.setIcon({
				path : 'images/off.png'
			});
			chrome.storage.sync.set({
				state : "off"
			}, function() {
				console.log('The state is set to off');
				chrome.tabs.onHighlighted.removeListener(moveTab);
				chrome.tabs.onUpdated.removeListener(moveTab);
				chrome.tabs.onCreated.removeListener(moveTab);
				chrome.tabs.onMoved.removeListener(moveTab);
				chrome.tabs.onAttached.removeListener(moveTab);
				chrome.tabs.onReplaced.removeListener(moveTab);
			});
		} else {
			chrome.browserAction.setIcon({
				path : 'images/tg128.png'
			});
			chrome.storage.sync.set({
				state : "on"
			}, function() {
				console.log('The state is set to on');
				chrome.tabs.onHighlighted.addListener(moveTab);
				chrome.tabs.onUpdated.addListener(moveTab);
				chrome.tabs.onCreated.addListener(moveTab);
				chrome.tabs.onMoved.addListener(moveTab);
				chrome.tabs.onAttached.addListener(moveTab);
				chrome.tabs.onReplaced.addListener(moveTab);
			});
		}
	});
};

function moveTab(tabs) {
	if (chrome.runtime.lastError) {
		console.log("ERROR");
	} else {
		var curURL;
		var len;
		var urls = [];
		var tgtIndex = 0;
		chrome.tabs.getAllInWindow(null, function(tabs) {
			len = tabs.length;
			// console.log(len);
			for (var i = 0; i < len; i++) {
				urls.push(tabs[i].url.replace("https://", "").replace(
						"chrome://newtab", "zzzz")
						+ String.fromCharCode(i));
				// urls.push(tabs[i].url.replace("www.", "")+i.toString());
				// if(tabs[i].url.includes("https:")){
				// urls.push(tabs[i].url.replace("www.", "")+i.toString());
				// }
				// else{
				// urls.push("https://" + tabs[i].url.replace("www.",
				// "")+i.toString());
				// }
			}
		});
		chrome.tabs.query({
			active : true, // Select active tabs
			lastFocusedWindow : true
		// In the current window
		}, function(tabs) {
			curURL = tabs[0].url.replace("https://", "").replace(
					"chrome://newtab", "zzzz")
					+ String.fromCharCode(tabs[0].index);
			// if(!curURL.includes("https:") && tabs[0].index >= urls.length){
			// return;
			// }
			var remIndex = urls.indexOf(curURL);
			if (remIndex !== -1)
				urls.splice(remIndex, 1);
			// console.log(curURL);
			// console.log(urls);
			// console.log(urls[tgtIndex]);
			// if(curURL.includes("chrome://newtab")){
			// tgtIndex = -1;
			// }
			// else{
			while (curURL > urls[tgtIndex]) {
				tgtIndex += 1;
			}
			// }
			// console.log("tgtIndex is: " + tgtIndex);
			chrome.tabs.move(tabs[0].id, {
				index : tgtIndex
			}, function() {
				if (chrome.runtime.lastError) {
					// console.log("Trying again in 200 ms.");
					setTimeout(moveTab, 200);
				}
			});
		});
	}
}
