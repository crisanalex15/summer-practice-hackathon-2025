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
    public class CommentsController : ControllerBase
    {
        private readonly AuthDbContext _context;

        public CommentsController(AuthDbContext context)
        {
            _context = context;
        }

        [HttpGet("project/{projectId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CommentResponseDto>>> GetCommentsByProject(int projectId)
        {
            var comments = await _context.Comments
                .Include(c => c.Admin)
                .Where(c => c.ProjectId == projectId)
                .Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    ProjectId = c.ProjectId,
                    AdminId = c.AdminId,
                    Admin = new UserDto
                    {
                        Id = c.Admin.Id,
                        Email = c.Admin.Email ?? "",
                        FirstName = c.Admin.FirstName ?? "",
                        LastName = c.Admin.LastName ?? ""
                    }
                })
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<CommentResponseDto>> GetComment(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.Admin)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound();
            }

            var response = new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                ProjectId = comment.ProjectId,
                AdminId = comment.AdminId,
                Admin = new UserDto
                {
                    Id = comment.Admin.Id,
                    Email = comment.Admin.Email ?? "",
                    FirstName = comment.Admin.FirstName ?? "",
                    LastName = comment.Admin.LastName ?? ""
                }
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<CommentResponseDto>> CreateComment(CreateCommentDto request)
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

            var comment = new Comment
            {
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                ProjectId = request.ProjectId,
                AdminId = userId
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Reload with admin info
            await _context.Entry(comment)
                .Reference(c => c.Admin)
                .LoadAsync();

            var response = new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                ProjectId = comment.ProjectId,
                AdminId = comment.AdminId,
                Admin = new UserDto
                {
                    Id = comment.Admin.Id,
                    Email = comment.Admin.Email ?? "",
                    FirstName = comment.Admin.FirstName ?? "",
                    LastName = comment.Admin.LastName ?? ""
                }
            };

            return CreatedAtAction(nameof(GetComment), new { id = comment.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CommentResponseDto>> UpdateComment(int id, UpdateCommentDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments
                .Include(c => c.Admin)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound();
            }

            // Only the author can update the comment
            if (comment.AdminId != userId)
            {
                return Forbid();
            }

            comment.Content = request.Content;
            await _context.SaveChangesAsync();

            var response = new CommentResponseDto
            {
                Id = comment.Id,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                ProjectId = comment.ProjectId,
                AdminId = comment.AdminId,
                Admin = new UserDto
                {
                    Id = comment.Admin.Id,
                    Email = comment.Admin.Email ?? "",
                    FirstName = comment.Admin.FirstName ?? "",
                    LastName = comment.Admin.LastName ?? ""
                }
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteComment(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound();
            }

            // Only the author can delete the comment
            if (comment.AdminId != userId)
            {
                return Forbid();
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 