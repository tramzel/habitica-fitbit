export function SubTaskTile(tile) {
  
  this.hide = () => {
    tile.style.display = "none";
  }
  
  this.show = () => {
    tile.style.display = "inline";
  }
  
  this.setText = (text) => {
    tile.getElementById("text").text = text;
  }
  
  this.clicks = (onclick) => {
    tile.firstChild.onclick = () => {
      onclick(tile.firstChild.value ? "down" : "up");
    }
  }
}