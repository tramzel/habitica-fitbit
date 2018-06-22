export function TaskDetail(view, screenWidth) {
  
  this.text = view.getElementById("text");
  this.bg = view.getElementById("task-background");
  this.habitButtons = view.getElementById("buttons-habit");
  this.plus = view.getElementById("plus");
  this.minus = view.getElementById("minus");
  
  this.setText = (text) => {
    this.text.text = text;
  };
  
  this.setColor = (color) => {
    this.bg.style.fill = color;
  };
  
  this.clicks = (onclick) => {
    this.plus.onclick = () => onclick("up");
    this.minus.onclick = () => onclick("down");
  };
  
  this.showPositiveAndNegative = () => {
    this.plus.width = screenWidth/2;
    this.minus.width = screenWidth/2;
    this.plus.x = screenWidth/2;
    this.plus.style.display = "inline"
    this.minus.style.display = "inline"
  }
  
  this.showPositive = () => {
    this.plus.width = screenWidth;
    this.plus.x = 0;
    this.plus.style.display = "inline"
    this.minus.style.display = "none"
  }
  
  this.showNegative = () => {
    this.minus.width = screenWidth;
    this.plus.style.display = "none"
    this.minus.style.display = "inline"
  }
}