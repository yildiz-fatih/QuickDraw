import * as signalR from "@microsoft/signalr";
import {state} from "./state";
import {clearDOM, showInDOM} from "./domUtils";
import {domElements} from "./domElements";
import {initializeDrawing, clearGrid, drawCell} from "./drawingManager";

export let connection;

export async function startConnection() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5286/drawhub")
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    await connection.start();

    return connection;
}

export function initializeSignalREvents() {
    connection.on("ReceiveAvailableRooms", (roomNames) => {
        const optionsDropdown = document.getElementById("roomsOptions");
        optionsDropdown.innerHTML = ""; // Clear existing options

        if (roomNames.length > 0) {
            roomNames.forEach((name) => {
                const option = document.createElement("option");
                option.value = name;
                option.text = name;
                optionsDropdown.appendChild(option);
            });
        }
    });

    connection.on("UserLoggedIn", (userName) => {
        state.currentUserName = userName;

        clearDOM();
        showInDOM(domElements.roomsContainer);
        domElements.userInfoElement.textContent = `Welcome ${state.currentUserName}`;
    })

    connection.on("NewUserJoinedRoom", (room) => {
        domElements.roomInfoElement.textContent = `Users in ${state.currentRoomName}: ${room.users.map(user => user.userName).join(", ")}`;
    });

    connection.on("RoomJoined", (room) => {
        // either it's the first see or the latter...
        state.currentRoomName = room.name;
        clearDOM();
        initializeDrawing(room.grid);

        domElements.roomInfoElement.textContent = `Users in ${state.currentRoomName}: ${room.users.map(user => user.userName).join(", ")}`;
    });

    connection.on("RoomLeft", (userNames) => {
        domElements.roomInfoElement.textContent = `Users in ${state.currentRoomName}: ${userNames.join(", ")}`;
    });

    connection.on("ReceiveDrawingData", (data) => {
        drawCell(data.row, data.column, data.color);
    });

    connection.on("ReceiveClearGrid", () => {
        clearGrid();
    });
}
