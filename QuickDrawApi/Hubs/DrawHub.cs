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
        
        UserRepository.Users.Add(user);
        
        Console.WriteLine($"{Context.ConnectionId} with username {userName} is logged in");
    }

    public async Task JoinRoom(string roomName)
    {
        var room = RoomRepository.Rooms.FirstOrDefault(r => r.Name == roomName);
        if (room == null)
        {
            room = new Room()
            {
                Name = roomName
            };
            RoomRepository.Rooms.Add(room);
            
            await Clients.All.SendAsync("ReceiveAvailableRooms", 
                RoomRepository.Rooms.Select(r => r.Name).ToList());
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        await Clients.Caller.SendAsync("RoomJoined", room.Name);

        Console.WriteLine($"User {Context.ConnectionId} " +
                          $"with username {UserRepository.Users.FirstOrDefault(user => user.ConnectionId == Context.ConnectionId).UserName} " +
                          $"joined room: {roomName}");
    }
    
}