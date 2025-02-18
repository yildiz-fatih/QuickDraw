namespace QuickDrawApi.Models;

public class Room
{
    public string Name { get; set; }
    public List<User> Users { get; set; }
    public Grid Grid { get; set; }
}