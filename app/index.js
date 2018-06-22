import * as messaging from "messaging";
import { HabiticaUI } from "./ui.js";
import { inbox } from "file-transfer"
import * as fs from "fs";
import { decode } from "cbor";
import { FeatureFlags } from "../common/featureflags";

let ui = new HabiticaUI();

//Listen to events

messaging.peerSocket.onopen = function() {
}
  
messaging.peerSocket.onmessage = function(evt) {
  console.log(evt.data.message);
  if (evt.data.rewards) {
    ui.hideDetail();
    ui.showStatus(evt.data.rewards);
    setTimeout(() => ui.hideStatus(), 2000);
  } else {
    ui.showStatus(evt.data.message);
  }
}

messaging.peerSocket.onerror = function(err) {
  state = "loading";
  ui.showStatus("Connection to the FitBit app has been lost");
}

inbox.onnewfile = function () {
  var fileName;
  do {
    fileName = inbox.nextFile();
    if (fileName === "tasks.cbor") {
      console.log("/private/data/" + fileName + " is now available");
      var data = fs.readFileSync(fileName,  "cbor");
      tasks = data;
      if (state === "loading") {
        showTaskList(true, false);
      } else {
        ui.hideStatus();
        showMenu();
      }
    } else if (fileName === "avatar.jpg") {
      console.log("/private/data/" + fileName + " is now available");
      
      ui.updateAvatar("/private/data/" + fileName);
    }
  } while (fileName);
};

ui.menuClicks(value => {
  listIndex = value;
  showTaskList(true, true);
});

ui.backClicks(handled => backPressed(handled));

//Interact with view

var tasks;
var state;
var listIndex;
const LIST_COLORS = [
  "#ffffff",
  "#993e76",
  "#4444AA",
  "#118811",
]

let showMenu = () => {
  state = "menu";
  ui.showMenu();
}

let showTaskList = (reload, scroll) => {
  var taskBinder;
  var list;
  if (reload) {
    switch (listIndex) {
      case 1:
        list = tasks.habits;
        break;
      case 2:
        list = tasks.daily;
        break;
      case 3:
        list = tasks.todos;
        break;
    }
    taskBinder = (tile, i) => bindTask(tile, list[i], listIndex);
  }
  state = "list";
  ui.showTaskList(taskBinder, scroll);
  if (list && list.length === 0) {
    ui.showStatus("No more items");
  }
}

let bindTask = (tile, task, listIndex) => {
  if (!task) {
    tile.hide();
    return;
  }
  var color = LIST_COLORS[listIndex];
  tile.show();
  tile.setText(task.text);
  tile.setColor(color);
  tile.clicks(() => showDetail(task, color, listIndex));
};

let scorePressed = (task, value) => {
  state = "loading";
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    ui.showStatus("Sending...");
    messaging.peerSocket.send({ id: task.id, value: value });
  } else {
    ui.showStatus("No connection to the FitBit app");
  }
}

let showDetail = (task, color, listIndex) => {
  state = "detail";
  ui.showDetail(
    (detailHolder) => bindDetail(task, detailHolder, listIndex, color), 
    (subTaskHolder, i) => bindSubTask(subTaskHolder, task.checklist[i], task.id)
  );
};

let bindDetail = (task, detailHolder, listIndex, color) => {
  detailHolder.setText(task.text);
  detailHolder.setColor(color);
  detailHolder.clicks(value => scorePressed(task, value));
  switch (listIndex) {
    case 1:
      if (task.up && task.down) {
        detailHolder.showPositiveAndNegative();
      } else if (task.up) {
        detailHolder.showPositive();
      } else {
        detailHolder.showNegative();
      }
      break;
    case 2:
    case 3:
      detailHolder.showPositive();
      break;
  }
};

let bindSubTask = (subTaskHolder, subTask, taskId) => {
  if (!FeatureFlags.SUBTASKS || !subTask) {
    subTaskHolder.hide();
    return;
  }
  subTaskHolder.setText(subTask.text);
  subTaskHolder.show();
  subTaskHolder.clicks(value => subTaskPressed(taskId, subTask.id, value));
};

let subTaskPressed = (id, subId, value) => {
  state = "loading";
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    ui.showStatus("Sending...");
    messaging.peerSocket.send({ id: id, subId: subId, value: value });
  } else {
    ui.showStatus("No connection to the FitBit app");
  }
}

let backPressed = handled => {
  if (state === "list") {
    handled();
    showMenu();
  } else if (state === "detail") {
    handled();
    showTaskList(false, false);
  }
}

