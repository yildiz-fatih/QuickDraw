import * as signalR from "@microsoft/signalr";
import { startApp } from "./drawing";

function clearDOM() {
  for (let container of document.querySelectorAll(".container")) {
    if (!container.classList.contains("hidden")) {
      container.classList.add("hidden");
    }
  }
}

// start the signalr connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5286/drawhub")
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.start();

// initial values
let currentUserName = "";
let currentRoomName = "";

// login button clicked >>
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  currentUserName = document.getElementById("userNameInput").value;

  connection.invoke("Login", currentUserName);

  clearDOM();
  document.getElementById("roomsContainer").classList.remove("hidden");
});

// join button clicked >>
document.getElementById("joinButton").addEventListener("click", (event) => {
  document.getElementById("joinContainer").classList.remove("hidden");
});

// create button clicked >>
document.getElementById("createButton").addEventListener("click", (event) => {
  document.getElementById("createContainer").classList.remove("hidden");
});

// create room submit button clicked >>
document
  .getElementById("createRoomSubmitButton")
  .addEventListener("click", (event) => {
    event.preventDefault();

    const roomName = document.getElementById("roomNameInput").value;

    connection.invoke("JoinRoom", roomName);
  });

// join room submit button clicked >>
document
  .getElementById("joinRoomSubmitButton")
  .addEventListener("click", (event) => {
    event.preventDefault();

    const roomName = document.getElementById("roomsOptions").value;

    connection.invoke("JoinRoom", roomName);
  });

connection.on("ReceiveAvailableRooms", (roomNames) => {
  const optionsDropdown = document.getElementById("roomsOptions");
  optionsDropdown.innerHTML = ""; // Clear existing options

  if (roomNames && roomNames.length > 0) {
    roomNames.forEach((roomName) => {
      const option = document.createElement("option");
      option.value = roomName; // !!!
      option.text = roomName;
      optionsDropdown.appendChild(option);
    });
  }
});

connection.on("RoomJoined", (roomName) => {
  currentRoomName = roomName;

  clearDOM();
  startApp();
});
