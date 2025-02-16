import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import {startConnection, initializeSignalREvents} from "./modules/signalRService";
import {initializeEventHandlers} from "./modules/eventHandlers";

// Initialize SignalR connection
await startConnection();
initializeSignalREvents();

// Event Listeners
initializeEventHandlers();
