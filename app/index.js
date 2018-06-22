import { HabiticaUI } from "./ui.js";
import { HabiticaMessages } from "./messages.js";
import { HabiticaController } from "./controller.js";

let ui = new HabiticaUI();
let messages = new HabiticaMessages();
let controller = new HabiticaController(ui, messages);
