using Microsoft.AspNetCore.SignalR;
using QuickDrawApi.Data;
using QuickDrawApi.Models;

namespace QuickDrawApi.Hubs;

public class DrawHub : Hub
{
    public async Task Login(string userName)
    {
        var user = new User()
        {
            ConnectionId = Context.ConnectionId,
            UserName = userName
        };
        
        UserRepository.AddUser(user);
        
        await Clients.Caller.SendAsync("UserLoggedIn", user.UserName);
        
        await Clients.All.SendAsync("ReceiveAvailableRooms", 
            RoomRepository.GetAvailableRoomNames());
    }
    
    public async Task JoinRoom(string roomName)
    {
        bool roomExists = RoomRepository.Exists(roomName);

        if (!roomExists)
        {
            var grid = new Grid
            {
                Width = 24, // Columns
                Height = 16, // Rows
                Cells = new List<Cell>()
            };

            // Populate the grid with cells
            for (int row = 0; row < grid.Height; row++)
            {
                for (int col = 0; col < grid.Width; col++)
                {
                    grid.Cells.Add(new Cell() { Row = row, Column = col, Color = "#D8D8D8"});
                }
            }
            
            var room = new Room
            {
                Name = roomName,
                Users = new List<User>(),
                Grid = grid
            };
            
            RoomRepository.AddRoom(room);
            
            var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
            room.Users.Add(user);
            
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            
            // Update client on the current list of rooms
            await Clients.All.SendAsync("ReceiveAvailableRooms", 
                RoomRepository.GetAvailableRoomNames());
            
            //  if the room is newly created OR is being joined by a new user,
            //         then the original user should receive all the room info
            await Clients.Caller.SendAsync("RoomJoined", room);
        }
        else
        {
            var room = RoomRepository.GetRoomByName(roomName);
            var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
            room.Users.Add(user);
            
            await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
            
            // Update client on the current list of rooms
            await Clients.All.SendAsync("ReceiveAvailableRooms", 
                RoomRepository.GetAvailableRoomNames());
            
            //  if the room is newly created OR is being joined by a new user,
            //         then the original user should receive all the room info
            await Clients.Caller.SendAsync("RoomJoined", room);
            
            // if the room existed before
            // Send updated room users to everyone ELSE in the room
            await Clients.OthersInGroup(roomName).SendAsync(
                "NewUserJoinedRoom", 
                new
                {
                    RoomName = room.Name,
                    Users = room.Users
                });
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
        if (user == null)
        {
            await base.OnDisconnectedAsync(exception);
            return;
        }

        var room = RoomRepository.Rooms.FirstOrDefault(r => r.Users.Contains(user));
        if (room != null)
        {
            room.Users.Remove(user);
            await Clients.Group(room.Name).SendAsync("RoomLeft", room.Users.Select(u => u.UserName).ToList());

            if (!room.Users.Any())
            {
                RoomRepository.RemoveRoom(room);
            }
        }

        UserRepository.RemoveUser(user);
    
        await base.OnDisconnectedAsync(exception);
    }

    public async Task BroadcastDrawingData(DrawingData drawingData)
    {
        var currentRoom = RoomRepository.GetRoomByName(drawingData.RoomName);
        var currentGrid = currentRoom.Grid;
        var currentCell = currentGrid.Cells.FirstOrDefault(c => c.Row == drawingData.Row && c.Column == drawingData.Column);
        currentCell.Color = drawingData.Color;

        await Clients.OthersInGroup(drawingData.RoomName).SendAsync("ReceiveDrawingData", drawingData);
    }

    public async Task BroadcastClearGrid(string roomName)
    {
        await Clients.OthersInGroup(roomName).SendAsync("ReceiveClearGrid");
    }
    
}
