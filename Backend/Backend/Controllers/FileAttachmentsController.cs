using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Backend.Areas.Identity.Data;
using Backend.Models.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileAttachmentsController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public FileAttachmentsController(AuthDbContext context)
        {
            _context = context;
        }

        [HttpGet("project/{projectId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FileAttachmentResponseDto>>> GetFileAttachmentsByProject(int projectId)
        {
            var attachments = await _context.FileAttachments
                .Where(f => f.ProjectId == projectId)
                .Select(f => new FileAttachmentResponseDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FileUrl = f.FileUrl,
                    ContentType = f.ContentType,
                    UploadedAt = f.UploadedAt,
                    ProjectId = f.ProjectId
                })
                .OrderBy(f => f.UploadedAt)
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FileAttachmentResponseDto>> GetFileAttachment(int id)
        {
            var attachment = await _context.FileAttachments
                .FirstOrDefaultAsync(f => f.Id == id);

            if (attachment == null)
            {
                return NotFound();
            }

            var response = new FileAttachmentResponseDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileUrl = attachment.FileUrl,
                ContentType = attachment.ContentType,
                UploadedAt = attachment.UploadedAt,
                ProjectId = attachment.ProjectId
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<FileAttachmentResponseDto>> CreateFileAttachment(CreateFileAttachmentDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            // Verify project exists
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.ProjectId);
            if (!projectExists)
            {
                return BadRequest("Project not found");
            }

            var attachment = new FileAttachment
            {
                FileName = request.FileName,
                FileUrl = request.FileUrl,
                ContentType = request.ContentType,
                UploadedAt = DateTime.UtcNow,
                ProjectId = request.ProjectId
            };

            _context.FileAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            var response = new FileAttachmentResponseDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileUrl = attachment.FileUrl,
                ContentType = attachment.ContentType,
                UploadedAt = attachment.UploadedAt,
                ProjectId = attachment.ProjectId
            };

            return CreatedAtAction(nameof(GetFileAttachment), new { id = attachment.Id }, response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteFileAttachment(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var attachment = await _context.FileAttachments
                .Include(f => f.Project)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (attachment == null)
            {
                return NotFound();
            }

            // Only the project owner can delete attachments
            if (attachment.Project.UserId != userId)
            {
                return Forbid();
            }

            _context.FileAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("upload")]
        public async Task<ActionResult<FileAttachmentResponseDto>> UploadFile(IFormFile file, [FromForm] int projectId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            // Verify project exists
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
            if (!projectExists)
            {
                return BadRequest("Project not found");
            }

            // Create uploads directory if it doesn't exist
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            // Generate unique filename
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsDir, fileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create file attachment record
            var attachment = new FileAttachment
            {
                FileName = file.FileName,
                FileUrl = $"/uploads/{fileName}",
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow,
                ProjectId = projectId
            };

            _context.FileAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            var response = new FileAttachmentResponseDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileUrl = attachment.FileUrl,
                ContentType = attachment.ContentType,
                UploadedAt = attachment.UploadedAt,
                ProjectId = attachment.ProjectId
            };

            return CreatedAtAction(nameof(GetFileAttachment), new { id = attachment.Id }, response);
        }
    }
} 