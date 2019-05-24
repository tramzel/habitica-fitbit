import document from "document";
import { TaskTile } from "./tasktile";
import { SubTaskTile } from "./subtasktile";
import { TaskDetail } from "./taskdetail";
import { FeatureFlags } from "../common/featureflags";

export function HabiticaUI() {
  
  this.status = document.getElementById("status");
  this.statusText = this.status.getElementById("text");
  this.menu = document.getElementById(FeatureFlags.AVATAR ? "menu-avatar" : "menu");
  this.taskList = document.getElementById("list-task");
  this.detail = document.getElementById("detail-task");
  this.root = document.getElementById('root');
  this.screenWidth = this.root.width;
  this.avatar = document.getElementById("avatar");
  
  this.taskTiles = [];
  this.subTaskTiles = [];
  for (let i = 0; i < 20; i++) {
    let taskTile = this.taskList.getElementById(`task-${i}`);
    if (taskTile) {
      this.taskTiles.push(new TaskTile(taskTile));
    }
    let subTaskTile = this.detail.getElementById(`subtask-${i}`);
    if (subTaskTile) {
      this.subTaskTiles.push(new SubTaskTile(subTaskTile));
    }
  }
  this.detailHolder = new TaskDetail(this.detail, this.screenWidth);
}

HabiticaUI.prototype.showStatus = function(text) {
  this.statusText.text = text;
  this.status.animate("enable");
  this.status.style.display = "inline";
}

HabiticaUI.prototype.hideStatus = function(text) {
  this.status.animate("disable");
  setTimeout(() => this.status.style.display = "none", 500);
}

HabiticaUI.prototype.showMenu = function() {
  this.taskList.style.display = "none";
  this.menu.style.display = "inline";
  this.detail.style.display = "none";
  this.hideStatus();
}

HabiticaUI.prototype.showTaskList = function(bindTile, scroll) {
  if (bindTile) {
    for (let i = 0; i < 20; i++) {
      let tile = this.taskTiles[i];
      if (tile) {
        bindTile(tile, i);
      }
    }
  }
  if (scroll) {
    this.taskList.value = 0;
  }
  this.taskList.style.display = "inline";
  this.menu.style.display = "none";
  this.detail.style.display = "none";
}

HabiticaUI.prototype.showDetail = function(bindTask, bindSubTask) {
  bindTask(this.detailHolder);
  for (let i = 0; i < 20; i++) {
    let tile = this.subTaskTiles[i];
    if (tile) {
      bindSubTask(tile, i);
    }
  }
  this.detail.value = 0;
  this.taskList.style.display = "none";
  this.menu.style.display = "none";
  this.detail.style.display = "inline";
}

HabiticaUI.prototype.hideDetail = function() {
  this.detail.style.display = "none";
}

HabiticaUI.prototype.menuClicks = function(onClick) {
  var self = this;
  this.menu.onclick = function(e) {
    onClick(FeatureFlags.AVATAR ? self.menu.value : self.menu.value + 1);
  }
}

HabiticaUI.prototype.backClicks = function(onClick) {
  document.onkeypress = function(evt) {
    if (evt.key === "back") {
      onClick(() => {
        evt.preventDefault();
      });
    }
  }
}

HabiticaUI.prototype.updateAvatar = function() {
  this.avatar.href = "/private/data/avatar.jpg";
}