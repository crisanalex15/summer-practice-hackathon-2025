using System.ComponentModel.DataAnnotations;

namespace Backend.Models.DTOs
{
    public class CreateFileAttachmentDto
    {
        [Required]
        public string FileName { get; set; }
        
        [Required]
        public string FileUrl { get; set; }
        
        [Required]
        public string ContentType { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
    }

    public class FileAttachmentResponseDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
        public int ProjectId { get; set; }
    }
} 