// Controllers/HomeController.cs
using Microsoft.AspNetCore.Mvc;

namespace HidroverdeDigital.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            // Redirect root to the Daily Manual page which already has a view.
            return RedirectToAction("Index", "DailyManual");
        }

        public IActionResult Dashboard()
        {
            return View();
        }
    }
}