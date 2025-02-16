import {domElements} from "./domElements";
import {state} from "./state";
import {connection} from "./signalRService";
import {clearDOM, hideInDOM, showInDOM} from "./domUtils";

export function initializeEventHandlers() {
    domElements.loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        state.currentUserName = document.getElementById("userNameInput").value;
        connection.invoke("Login", state.currentUserName);

        clearDOM();

        showInDOM(domElements.roomsContainer);

        domElements.userInfoElement.textContent = `Welcome ${state.currentUserName}`;
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

        state.currentRoomName = roomName;
    });

    domElements.joinRoomForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const roomName = document.getElementById("roomsOptions").value;

        connection.invoke("JoinRoom", roomName);

        state.currentRoomName = roomName;
    })
}