using QuickDrawApi.Models;

namespace QuickDrawApi.Data;

public static class UserRepository
{
    public static List<User> Users { get; } = new();

    public static User GetUserByConnectionId(string connectionId)
    {
        return Users.FirstOrDefault(u => u.ConnectionId == connectionId);
    }

    public static void AddUser(User user)
    {
        Users.Add(user);
    }

    public static void RemoveUser(User user)
    {
        Users.Remove(user);
    }
}