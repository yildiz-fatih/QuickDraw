namespace QuickDrawApi.Models;

public class Grid
{
    public int Width { get; set; }
    public int Height { get; set; }
    public List<Cell> Cells { get; set; }
}