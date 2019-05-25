import { me } from "companion";
import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { outbox } from "file-transfer"
import { encode } from "cbor";
import { FeatureFlags } from "../common/featureflags";

import { HabiticaApi } from "./habitica.js"

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

console.log("Companion Started");

let habiticaApi = new HabiticaApi();

settingsStorage.onchange = function(evt) {
  console.log("Settings changed");
  init();
}

messaging.peerSocket.onopen = function() {
  console.log("Peer socket open");
  init();
  listenToMessages();
}

function init() {
  console.log("Companion init");
  var initPromise = login()
    .then(() => messaging.peerSocket.send({ message: "Loading tasks...", type: "loading" }))
    .then(loadTasks)
  
  if (FeatureFlags.AVATAR) {
    initPromise = initPromise.then(loadAvatar)
  }
  
  initPromise.catch(handleError);
}

function listenToMessages() {
  messaging.peerSocket.onmessage = function(evt) {
    console.log(JSON.stringify(evt.data));
    var data = evt.data;
    if (data.subId) {
      scoreSubTask(data.id, data.subId, data.value);
    } else {
      scoreTask(data.id, data.value);
    }
  };
}

function login() {
  return new Promise((resolve, reject) => {
    try {
      console.log("Loading api keys");
      let userId = getSetting( "userId").trim();
      let apiToken = getSetting("apiToken").trim();
      resolve({userId: userId, apiToken: apiToken});
    } catch (error) {
      try {
        console.log("No api keys, loading username/password");
        var username = getSetting("username").trim();
        var password = getSetting("password").trim();
      } catch (error) {
        console.error("Error loading settings");
      }
      // Logging in with empty credentials triggers message to configure app
      // @TODO maybe cleaner handling
      resolve({username: username, password: password});
    }
  }).then(async credentials => {
    if ( credentials.userId ) {
      console.log("Using stored api credentials");
      habiticaApi.setApiKeys(credentials.userId, credentials.apiToken);
    } else {
      console.log("Logging in");
      let keys = await habiticaApi.login(credentials.username, credentials.password);
      if (keys.id && keys.apiToken) {
        setSetting("userId", keys.id);
        setSetting("apiToken", keys.apiToken);
      }
    }
  });
}

function loadTasks(loginJson) {
  return habiticaApi.userTasks()
    .then(tasksResponse => outbox.enqueue("tasks.cbor", encode(tasksResponse)))
};

function loadAvatar(ft) {
  messaging.peerSocket.send({ message: "Loading avatar...", type: "loading" });
  return habiticaApi.avatar().then(data => {
    console.log(data);
    let destFilename = "avatar.jpg";
    return outbox.enqueue(destFilename, data);
  });
};

function handleError (error) {
  messaging.peerSocket.send({ message: error.message });
}

function scoreTask(id, data) {
  habiticaApi.scoreTask(id, data)
    .then(json => {
      var rewards = "";
      rewards += "HP: " + json.data.hp;
      rewards += "\nMP: " + json.data.mp;
      rewards += "\nGP: " + json.data.gp.toFixed(1);
      rewards += "\nEXP: " + json.data.exp;
      rewards += "\nLVL: " + json.data.lvl;
      loadTasks();
      messaging.peerSocket.send({ rewards: rewards });
    })
    .catch(error => messaging.peerSocket.send({ message: error.message }));
}

function scoreSubTask(id, subId, data) {
  habiticaApi.scoreSubTask(id, subId, data)
    .then(json => loadTasks())
    .catch(error => messaging.peerSocket.send({ message: error.message }));
}

function getSetting(key) {
  return JSON.parse(settingsStorage.getItem(key)).name;
}
 function setSetting(key, val) {
  settingsStorage.setItem(key, JSON.stringify({name: val}));
 }
