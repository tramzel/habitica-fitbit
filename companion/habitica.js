/*
 * Entry point for the companion app
 */
export function HabiticaApi() {
}

const STATUS_URL = "https://habitica.com/api/v3/status";
const LOGIN_URL = "https://habitica.com/api/v3/user/auth/local/login";
const USER_URL = "https://habitica.com/api/v3/user";
const USER_TASKS_URL = "https://habitica.com/api/v3/tasks/user";
const SCORE_TASK_URL = "https://habitica.com/api/v3/tasks/"; //:taskId/score/:direction
const IMAGE_CONVERT_URL = 
      "https://process.filestackapi.com/AoVBGb2YhS3G8IFKwx8iMz/output=format:jpg/https://habitica.com/export/avatar-";

var userId;
var apiToken;
var handleResponse = (response) => {
  return response.json().then((responseJson) => {
    console.log(JSON.stringify(responseJson));
    if (responseJson.success === false) {
      if (responseJson.errors) {
        return Promise.reject(Error(responseJson.errors[0].message));
      }
      return Promise.reject(Error(responseJson.message));
    }
    return responseJson;
  })
};

HabiticaApi.prototype.status = function() {
  return fetch(STATUS_URL).then(function(response) {
    return handleResponse(response);
  });
}

HabiticaApi.prototype.login = function(username, password) {
  return fetch(LOGIN_URL, {
    body: JSON.stringify({username: username, password: password}),
    headers: { 'content-type': 'application/json' },
    method: 'POST'
  }).then(function(response) {
    return handleResponse(response);
  }).then(function(response) {
    var data = response.data;
    apiToken = data.apiToken;
    userId = data.id;
    return data;
  });
}

HabiticaApi.prototype.user = function() {
  return fetch(USER_URL, {
    headers: { 'x-api-user': userId , 'x-api-key': apiToken}
  }).then(function(response) {
    return handleResponse(response);
  });
}

HabiticaApi.prototype.userTasks = function() {
  return fetch(USER_TASKS_URL, {
    headers: { 'x-api-user': userId , 'x-api-key': apiToken}
  }).then(function(response) {
    return handleResponse(response);
  }).then(function(response) {
    var tasks = {
      habits: [],
      daily: [],
      todos: []
    }
    response.data.forEach(task => {
      var type = task.type;
      var returnTask = {
        id: task.id,
        text: task.text
      };
      if (type === "habit") {
        returnTask.up = task.up;
        returnTask.down = task.down;
        returnTask.checklist = [];
        tasks.habits.push(returnTask);
      } else if (!task.completed) {
        returnTask.checklist = task.checklist;
        if (type === "daily") {
          tasks.daily.push(returnTask);
        } else if (type === "todo") {
          tasks.todos.push(returnTask);
        }
      }
    });
    return tasks;
  });
}

HabiticaApi.prototype.avatar = function() {
  return fetch(IMAGE_CONVERT_URL + userId + ".png", {
    headers: { 'x-api-user': userId , 'x-api-key': apiToken}
  }).then(function(response) {
      return response.arrayBuffer();
  });
}

HabiticaApi.prototype.scoreTask = function(id, direction) {
  return fetch(SCORE_TASK_URL + id + "/score/" + direction, {
    headers: { 'x-api-user': userId , 'x-api-key': apiToken},
    method: 'POST'
  }).then(function(response) {
    return handleResponse(response);
  });
}

HabiticaApi.prototype.scoreSubTask = function(id, subId, direction) {
  console.log("https://habitica.com/api/v3/task/" + id + "/checklist/" + subId + "/score/" + direction);
  return fetch("https://habitica.com/api/v3/task/" + id + "/checklist/" + subId + "/score/" + direction, {
    headers: { 'x-api-user': userId , 'x-api-key': apiToken},
    method: 'POST'
  }).then(function(response) {
    return handleResponse(response);
  });
}