using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class CreateProjectDto
    {
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        public string CodeContent { get; set; }
        
        public string Tags { get; set; }
        
        public string Access { get; set; } = "public"; // public, private
        
        public string AccessId { get; set; } = ""; // pentru acces specific
    }

    public class UpdateProjectDto
    {
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        [Required]
        public string CodeContent { get; set; }
        
        public string Tags { get; set; }
        
        public ProjectStatus Status { get; set; }
        
        public string Access { get; set; } // public, private
        
        public string AccessId { get; set; } // pentru acces specific
    }

    public class ProjectResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string CodeContent { get; set; }
        public string Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ProjectStatus Status { get; set; }
        public string UserId { get; set; }
        public string Access { get; set; }
        public string AccessId { get; set; }
        public UserDto User { get; set; }
        public List<CommentResponseDto> Comments { get; set; }
        public List<FileAttachmentResponseDto> FileAttachments { get; set; }
    }

    public class ProjectListDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Tags { get; set; }
        public DateTime CreatedAt { get; set; }
        public ProjectStatus Status { get; set; }
        public string UserId { get; set; }
        public string Access { get; set; }
        public string AccessId { get; set; }
        public UserDto User { get; set; }
        public int CommentsCount { get; set; }
        public int AttachmentsCount { get; set; }
    }
} 