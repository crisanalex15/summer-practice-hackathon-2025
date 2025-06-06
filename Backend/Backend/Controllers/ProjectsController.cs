using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    public class ProjectsController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public ProjectsController(AuthDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProjectListDto>>> GetProjects()
        {
            var projects = await _context.Projects
                .Include(p => p.User)
                .Include(p => p.Comments)
                .Include(p => p.FileAttachments)
                .Select(p => new ProjectListDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Tags = p.Tags,
                    CreatedAt = p.CreatedAt,
                    Status = p.Status,
                    User = new UserDto
                    {
                        Id = p.User.Id,
                        Email = p.User.Email ?? "",
                        FirstName = p.User.FirstName ?? "",
                        LastName = p.User.LastName ?? ""
                    },
                    CommentsCount = p.Comments.Count(),
                    AttachmentsCount = p.FileAttachments.Count()
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProjectResponseDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.User)
                .Include(p => p.Comments)
                    .ThenInclude(c => c.Admin)
                .Include(p => p.FileAttachments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var response = new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CodeContent = project.CodeContent,
                Tags = project.Tags,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                Status = project.Status,
                UserId = project.UserId,
                User = new UserDto
                {
                    Id = project.User.Id,
                    Email = project.User.Email ?? "",
                    FirstName = project.User.FirstName ?? "",
                    LastName = project.User.LastName ?? ""
                },
                Comments = project.Comments.Select(c => new CommentResponseDto
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
                }).ToList(),
                FileAttachments = project.FileAttachments.Select(f => new FileAttachmentResponseDto
                {
                    Id = f.Id,
                    FileName = f.FileName,
                    FileUrl = f.FileUrl,
                    ContentType = f.ContentType,
                    UploadedAt = f.UploadedAt,
                    ProjectId = f.ProjectId
                }).ToList()
            };

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectResponseDto>> CreateProject(CreateProjectDto request)
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

            var project = new Project
            {
                Title = request.Title,
                Description = request.Description,
                CodeContent = request.CodeContent,
                Tags = request.Tags ?? "",
                CreatedAt = DateTime.UtcNow,
                Status = ProjectStatus.InReview,
                UserId = userId,
                Access = "public", // Default public access
                AccessId = ""      // Empty for now
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Reload with user info
            await _context.Entry(project)
                .Reference(p => p.User)
                .LoadAsync();

            var response = new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CodeContent = project.CodeContent,
                Tags = project.Tags,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                Status = project.Status,
                UserId = project.UserId,
                User = new UserDto
                {
                    Id = project.User.Id,
                    Email = project.User.Email ?? "",
                    FirstName = project.User.FirstName ?? "",
                    LastName = project.User.LastName ?? ""
                },
                Comments = new List<CommentResponseDto>(),
                FileAttachments = new List<FileAttachmentResponseDto>()
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProjectResponseDto>> UpdateProject(int id, UpdateProjectDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await _context.Projects
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            // Only the owner can update the project
            if (project.UserId != userId)
            {
                return Forbid();
            }

            project.Title = request.Title;
            project.Description = request.Description;
            project.CodeContent = request.CodeContent;
            project.Tags = request.Tags ?? "";
            project.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var response = new ProjectResponseDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CodeContent = project.CodeContent,
                Tags = project.Tags,
                CreatedAt = project.CreatedAt,
                UpdatedAt = project.UpdatedAt,
                Status = project.Status,
                UserId = project.UserId,
                User = new UserDto
                {
                    Id = project.User.Id,
                    Email = project.User.Email ?? "",
                    FirstName = project.User.FirstName ?? "",
                    LastName = project.User.LastName ?? ""
                },
                Comments = new List<CommentResponseDto>(),
                FileAttachments = new List<FileAttachmentResponseDto>()
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProject(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            // Only the owner can delete the project
            if (project.UserId != userId)
            {
                return Forbid();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
} 