using Microsoft.AspNetCore.SignalR;
using QuickDrawApi.Data;
using QuickDrawApi.Models;

namespace QuickDrawApi.Hubs;

public class DrawHub : Hub
{
    public async Task LoginUserRequest(string userName)
    {
        var user = new User()
        {
            ConnectionId = Context.ConnectionId,
            UserName = userName
        };
        
        UserRepository.AddUser(user);
        
        await Clients.Caller.SendAsync("UserLoggedIn", user.UserName);
        
        await Clients.All.SendAsync("AvailableRoomsUpdated", 
            RoomRepository.GetAvailableRoomNames());
    }

    public async Task CreateRoomRequest(string roomName)
    {
        var room = new Room
        {
            Name = roomName,
            Users = new List<User>(),
            Grid = GetDefaultGrid()
        };
        
        RoomRepository.AddRoom(room);
        
        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
        room.Users.Add(user);

        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
    
        // Update all clients with the current list of rooms
        await Clients.All.SendAsync("AvailableRoomsUpdated", 
            RoomRepository.GetAvailableRoomNames());
    
        // Send the room details to the caller
        await Clients.Caller.SendAsync("RoomEntered", room);
    }
    
    public async Task JoinRoomRequest(string roomName)
    {
        var room = RoomRepository.GetRoomByName(roomName);

        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
        room.Users.Add(user);

        await Clients.OthersInGroup(roomName).SendAsync(
            "RoomParticipantsUpdated", 
            room.Users.Select(u => u.UserName).ToList()
        );
    
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
    
        // Update all clients with the current list of rooms
        await Clients.All.SendAsync("AvailableRoomsUpdated", 
            RoomRepository.GetAvailableRoomNames());
    
        // Send the room details to the caller
        await Clients.Caller.SendAsync("RoomEntered", room);
    }

    private Grid GetDefaultGrid()
    {
        var grid = new Grid
        {
            Width = 36, // Columns
            Height = 24, // Rows
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
        
        return grid;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);

        var room = RoomRepository.Rooms.FirstOrDefault(r => r.Users.Contains(user));
        if (room != null)
        {
            room.Users.Remove(user);
            await Clients.Group(room.Name).SendAsync("RoomParticipantsUpdated", room.Users.Select(u => u.UserName).ToList());

            if (!room.Users.Any())
            {
                RoomRepository.RemoveRoom(room);
            }
        }

        UserRepository.RemoveUser(user);
    
        await base.OnDisconnectedAsync(exception);
    }

    public async Task UpdateCellRequest(DrawingData drawingData)
    {
        var currentRoom = RoomRepository.GetRoomByName(drawingData.RoomName);
        var currentGrid = currentRoom.Grid;
        var currentCell = currentGrid.Cells.FirstOrDefault(c => c.Row == drawingData.Row && c.Column == drawingData.Column);
        currentCell.Color = drawingData.Color;

        await Clients.OthersInGroup(drawingData.RoomName).SendAsync("CellUpdated", drawingData);
    }

    public async Task ClearGridRequest(string roomName)
    {
        await Clients.OthersInGroup(roomName).SendAsync("GridCleared");
    }
    
}
