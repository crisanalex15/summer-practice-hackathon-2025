using Backend.Areas.Identity.Data;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string CodeContent { get; set; } // cod efectiv sau link la fișier

    public string Tags { get; set; } // ex: "C#,React,Backend"
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ProjectStatus Status { get; set; }

    public string UserId { get; set; }
    public ApplicationUser User { get; set; }

    // acces alti utilizatori
    public string Access { get; set; } // public, private
    public string AccessId { get; set; }

    public ICollection<Comment> Comments { get; set; }
    public ICollection<FileAttachment> FileAttachments { get; set; }
}

public enum ProjectStatus
{
    InReview,
    Approved,
    NeedsChanges
}