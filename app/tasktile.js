export function TaskTile(tile) {
  
  this.hide = () => {
    tile.style.display = "none";
  }
  
  this.show = () => {
    tile.style.display = "inline";
  }
  
  this.setText = (text) => {
    tile.getElementById("text").text = text;
  }
  
  this.setColor = (color) => {
    tile.getElementById("task-background").style.fill = color;
  }
  
  this.clicks = (onclick) => {
    tile.onclick = onclick;
  }
}