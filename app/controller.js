import { FeatureFlags } from "../common/featureflags";

export function HabiticaController(ui, messages) {
  
  var tasks;
  var state;
  var listIndex;
  const LIST_COLORS = [
    "#ffffff",
    "#993e76",
    "#4444AA",
    "#118811",
  ]
  
  let onAvatar = () => {
    ui.updateAvatar();
  }

  let onTasks = data =>{
    tasks = data;
    if (state === "loading") {
      showTaskList(true, false);
    } else {
      ui.hideStatus();
      showMenu();
    }
  }

  let onStatus = message => {
    console.log(message);
    ui.showStatus(message);
  }

  let onRewards = rewards => {
    console.log(rewards);
    ui.hideDetail();
    ui.showStatus(rewards);
    setTimeout(() => ui.hideStatus(), 2000);
  }

  let onDisconnected = () => {
    state = "loading";
    ui.showStatus("Connection to the FitBit app has been lost");
  }
  
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
    messages.getSocket().then(peerSocket => {
      ui.showStatus("Sending...");
      peerSocket.send({ id: task.id, value: value });
    }).catch(err => {
      ui.showStatus("No connection to the FitBit app");
    });
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
    messages.getSocket().then(peerSocket => {
      ui.showStatus("Sending...");
      peerSocket.send({ id: id, subId: subId, value: value });
    }).catch(err => {
      ui.showStatus("No connection to the FitBit app");
    });
  }
  
  //Listen to events
  ui.menuClicks(value => {
    listIndex = value;
    showTaskList(true, true);
  });

  ui.backClicks(handled => {
    if (state === "list") {
      handled();
      showMenu();
    } else if (state === "detail") {
      handled();
      showTaskList(false, false);
    }
  });

  messages.messages(onStatus, onRewards);
  
  messages.files(onTasks, onAvatar);
  
  messages.disconnections(onDisconnected);
}