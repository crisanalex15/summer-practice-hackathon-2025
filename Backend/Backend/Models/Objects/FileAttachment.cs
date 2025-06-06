using NuGet.Common;

public class FileAttachment
{
    public int Id { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }

    public string ContentType { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int ProjectId { get; set; }
    public Project Project { get; set; }
}   