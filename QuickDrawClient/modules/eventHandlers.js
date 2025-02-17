import {domElements} from "./domElements";
import {connection} from "./signalRService";
import {hideInDOM, showInDOM} from "./domUtils";

export function initializeEventHandlers() {
    domElements.loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const userName = document.getElementById("userNameInput").value;
        connection.invoke("Login", userName);
    });

    domElements.joinARoomButton.addEventListener("click", () => {
        hideInDOM(domElements.createRoomForm);
        showInDOM(domElements.joinRoomForm);
    });

    domElements.createARoomButton.addEventListener("click", () => {
        hideInDOM(domElements.joinRoomForm);
        showInDOM(domElements.createRoomForm);
    });

    domElements.createRoomForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const roomName = document.getElementById("roomNameInput").value;

        connection.invoke("JoinRoom", roomName);
    });

    domElements.joinRoomForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const roomName = document.getElementById("roomsOptions").value;

        connection.invoke("JoinRoom", roomName);
    })
}