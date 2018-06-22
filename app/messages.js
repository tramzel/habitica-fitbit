import * as messaging from "messaging";
import { inbox } from "file-transfer";
import * as fs from "fs";

export function HabiticaMessages() {
  
  HabiticaMessages.prototype.messages = function(onStatus, onRewards) {
    messaging.peerSocket.onopen = function() {
    }

    messaging.peerSocket.onmessage = function(evt) {
      if (evt.data.rewards) {
        onRewards(evt.data.rewards)
      } else {
        onStatus(evt.data.message)
      }
    }
  }
  
  HabiticaMessages.prototype.disconnections = function(onDisconnected) {
    messaging.peerSocket.onerror = function(err) {
      onDisconnected();
    }
  }

  HabiticaMessages.prototype.files = function(onTasks, onAvatar) {
    inbox.onnewfile = function () {
      var fileName;
      do {
        fileName = inbox.nextFile();
        console.log("/private/data/" + fileName + " is now available");
        if (fileName === "tasks.cbor") {
          onTasks(fs.readFileSync(fileName,  "cbor"))
        } else if (fileName === "avatar.jpg") {
          onAvatar()
        }
      } while (fileName);
    };
  }
  
  HabiticaMessages.prototype.getSocket = function() {
    return new Promise(function(resolve, reject) {
      if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        resolve(messaging.peerSocket);
      } else {
        reject();
      }
    });
  }
}