using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class CreateCommentDto
    {
        [Required]
        public string Content { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
    }

    public class UpdateCommentDto
    {
        [Required]
        public string Content { get; set; }
    }

    public class CommentResponseDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ProjectId { get; set; }
        public string AdminId { get; set; }
        public UserDto Admin { get; set; }
    }
} 