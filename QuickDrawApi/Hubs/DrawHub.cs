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
    }
    
    public async Task JoinRoom(string roomName)
    {
        // Get current user
        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);

        // Find or create room
        var room = RoomRepository.GetRoomByName(roomName);
        if (room == null)
        {
            room = new Room { 
                Name = roomName, 
                Users = new List<User>() 
            };
            RoomRepository.AddRoom(room);
        }

        room.Users.Add(user);
        
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);

        // Update client on the current list of rooms
        await Clients.All.SendAsync("ReceiveAvailableRooms", 
            RoomRepository.GetAvailableRoomNames());
        
        // Send updated room users to everyone in the room
        await Clients.Group(roomName).SendAsync("RoomJoined", 
            room);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = UserRepository.GetUserByConnectionId(Context.ConnectionId);
        if (user != null)
        {
            foreach (var room in RoomRepository.Rooms.Where(r => r.Users.Contains(user)))
            {
                room.Users.Remove(user);
                await Clients.Group(room.Name).SendAsync("UsersInRoomUpdated", 
                    room.Users.Select(u => u.UserName).ToList());
            
                if (!room.Users.Any())
                {
                    RoomRepository.RemoveRoom(room);
                }
            }
        }
        await base.OnDisconnectedAsync(exception);
    }
    
}