namespace QuickDrawApi.Models;

public class Room
{
    public string Name { get; set; }
    public List<User> Users { get; set; }
    public Grid Grid { get; set; }
}

public class Grid
{
    public int Width { get; set; }
    public int Height { get; set; }
    public List<Cell> Cells { get; set; }
}

public class Cell
{
    public int Row { get; set; }
    public int Column { get; set; }
    
    public string Color { get; set; }
}
