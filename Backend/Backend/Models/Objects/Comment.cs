using Backend.Areas.Identity.Data;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }

    public int ProjectId { get; set; }
    public Project Project { get; set; }

    public string AdminId { get; set; }
    public ApplicationUser Admin { get; set; } // doar adminii pot comenta
}