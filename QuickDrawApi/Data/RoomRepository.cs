using QuickDrawApi.Models;

namespace QuickDrawApi.Data;

public static class RoomRepository
{
    public static List<Room> Rooms { get; } = new();

    public static bool Exists(string roomName)
    {
        return Rooms.Any(room => room.Name == roomName);
    }
    
    public static Room GetRoomByName(string roomName)
    {
        return Rooms.FirstOrDefault(room => room.Name == roomName);
    }

    public static List<string> GetAvailableRoomNames()
    {
        return Rooms.Select(room => room.Name).ToList();
    }

    public static void AddRoom(Room room)
    {
        Rooms.Add(room);
    }

    public static void RemoveRoom(Room room)
    {
        Rooms.Remove(room);
    }
}