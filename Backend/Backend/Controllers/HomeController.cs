using System.Diagnostics;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Areas.Identity.Data;

namespace Backend.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly AuthDbContext _context;

        public HomeController(ILogger<HomeController> logger, AuthDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult GetToSwagger()
        {
            return Redirect("/swagger");
        }

        [Authorize]
        public IActionResult GetAllProjects()
        {
            var projects = _context.Projects.ToList();
            return Json(projects);
        }

        [Authorize]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Json(users);
        }

        public IActionResult Index()
        {
            var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            ViewData["UserID"] = user;
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
