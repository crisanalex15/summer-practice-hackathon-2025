using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Backend.Areas.Identity.Data;

namespace Backend.Models
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        
        // Foreign keys
        public string UserId { get; set; }  // Changed from int to string to match ApplicationUser.Id
        
        // Navigation properties
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }
        public ICollection<Comment> Comments { get; set; }
        public ICollection<FileAttachment> FileAttachments { get; set; }
    }

    public class Comment
    {
        [Key]
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Foreign keys
        public int ProjectId { get; set; }
        public string AdminId { get; set; }  // Changed from UserId to AdminId and type to string
        
        // Navigation properties
        [ForeignKey("ProjectId")]
        public Project Project { get; set; }
        
        [ForeignKey("AdminId")]
        public ApplicationUser Admin { get; set; }
    }

    public class FileAttachment
    {
        [Key]
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        
        // Foreign keys
        public int ProjectId { get; set; }
        
        // Navigation properties
        [ForeignKey("ProjectId")]
        public Project Project { get; set; }
    }
} 