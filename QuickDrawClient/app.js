import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import {
  startConnection,
  initializeSignalREvents,
} from "./modules/signalRService";
import { initializeEventHandlers } from "./modules/eventHandlers";

(async () => {
  await startApp();
})();

async function startApp() {
  try {
    // Initialize SignalR connection
    await startConnection();
    initializeSignalREvents();

    // Event Listeners
    initializeEventHandlers();
  } catch (error) {
    console.error("Error starting app:", error);
  }
}
