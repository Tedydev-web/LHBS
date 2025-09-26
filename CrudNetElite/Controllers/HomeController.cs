using CrudNetElite.Data;
using CrudNetElite.Helpers;
using CrudNetElite.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Reflection;

namespace CrudNetElite.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private DefaultDBContext _db;
        private readonly string viewFolder = "Home";

        public HomeController(ILogger<HomeController> logger, DefaultDBContext db)
        {
            _logger = logger;
            _db = db;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Edit(string id)
        {
            ClientViewModel model = new ClientViewModel();
            if (!string.IsNullOrEmpty(id))
            {
                model = _db.Clients.AsNoTracking().Where(c => c.Id == id)
                    .Select(c => new ClientViewModel { Name = c.Name, EmailAddress = c.EmailAddress, Notes = c.Notes })
                    .FirstOrDefault() ?? new ClientViewModel();
                model.Id = id;
            }
            return View(model);
        }

        [HttpPost]
        public IActionResult Edit(ClientViewModel model)
        {
            try
            {
                ValidateModel(model);

                if (!ModelState.IsValid)
                {
                    return View(model);
                }

                bool result = SaveRecord(model);
                if (result == false)
                {
                    TempData["NotifyFailed"] = "Sorry, something wrong. Please try again later.";
                }
                else
                {
                    ModelState.Clear();
                    TempData["NotifySuccess"] = "Saved successfully!";
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"{GetType().Name} - {MethodBase.GetCurrentMethod().Name} Method");
            }

            return RedirectToAction("index");
        }

        [HttpPost]
        public async Task<IActionResult> GetPartialViewListing([FromBody] dynamic requestData)
        {
            try
            {
                string sort = requestData.sort?.Value ?? "";
                int? size = (int.TryParse(requestData.size.Value, out int parsedSize)) ? parsedSize : null;
                string search = requestData.search?.Value ?? "";
                int? pg = (int.TryParse(requestData.pg.Value, out int parsedPg)) ? parsedPg : 1;

                List<ColumnHeader> headers = new List<ColumnHeader>();
                if (string.IsNullOrEmpty(sort))
                {
                    sort = ClientTableConfig.DefaultSortOrder;
                }
                headers = TableHelper.GetColumnHeaders(ClientTableConfig.DefaultColumnHeaders, sort);
                var list = ReadRecords();//Query to read all the records
                list = ClientTableConfig.PerformSearch(list, search);//Query to perform search
                list = ClientTableConfig.PerformSort(list, sort);//Query to further perform sort
                ViewData["CurrentSort"] = sort;
                ViewData["CurrentPage"] = pg ?? 1;
                ViewData["CurrentSearch"] = search;
                int? total = list.Count();
                int? defaultSize = ClientTableConfig.DefaultPageSize;
                size = size == 0 || size == null ? (defaultSize != -1 ? defaultSize : total) : size == -1 ? total : size;
                ViewData["CurrentSize"] = size;
                PaginatedList<ClientViewModel> result = await PaginatedList<ClientViewModel>
                    .CreateAsync(list, pg ?? 1, size.Value, total.Value, headers, ClientTableConfig.SearchMessage);
                return PartialView($"~/Views/{viewFolder}/_Table.cshtml", result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"{GetType().Name} - {MethodBase.GetCurrentMethod()?.Name} Method");
            }
            return PartialView("~/Views/Shared/Error.cshtml", null);
        }

        public IQueryable<ClientViewModel> ReadRecords()
        {
            var result = from t1 in _db.Clients.AsNoTracking()
                         orderby t1.Name
                         select new ClientViewModel
                         {
                             Id = t1.Id,
                             Name = t1.Name,
                             EmailAddress = t1.EmailAddress,
                             Notes = t1.Notes
                         };
            return result;
        }

        public void ValidateModel(ClientViewModel model)
        {
            bool nameFound = false;
            nameFound = string.IsNullOrEmpty(model.Id) ? _db.Clients.Any(a => a.Name == model.Name) :
                _db.Clients.Any(a => a.Name == model.Name && a.Id != model.Id);
            bool emailFound = false;
            emailFound = string.IsNullOrEmpty(model.Id) ? _db.Clients.Any(a => a.EmailAddress == model.EmailAddress) :
                _db.Clients.Any(a => a.EmailAddress == model.EmailAddress && a.Id != model.Id);
            if (nameFound)
            {
                ModelState.AddModelError("Name", "Name already existed.");
            }
            if (emailFound)
            {
                ModelState.AddModelError("EmailAddress", "Email Address already existed.");
            }
        }

        public bool SaveRecord(ClientViewModel model)
        {
            try
            {
                Client client = new Client();
                if (!string.IsNullOrEmpty(model.Id))
                {
                    client = _db.Clients.Find(model.Id) ?? new Client();
                }
                else
                {
                    client.Id = Guid.NewGuid().ToString();
                }
                client.Name = model.Name;
                client.EmailAddress = model.EmailAddress;
                client.Notes = model.Notes;
                if (!string.IsNullOrEmpty(model.Id))
                {
                    _db.Entry(client).State = EntityState.Modified;
                }
                else
                {
                    _db.Clients.Add(client);
                }
                _db.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"{GetType().Name} - {MethodBase.GetCurrentMethod()?.Name} Method");
                return false;
            }
        }

        public IActionResult Delete(string Id)
        {
            try
            {
                if (Id != null)
                {
                    Client client = _db.Clients.Find(Id);
                    if (client != null)
                    {
                        _db.Clients.Remove(client);
                        _db.SaveChanges();
                    }
                }
                TempData["NotifySuccess"] = "Deleted successfully!";
            }
            catch (DbUpdateConcurrencyException ex)
            {
                // Handle concurrency conflict
                var entry = ex.Entries.Single();
                if (entry != null)
                {
                    var databaseValues = (Client)entry.GetDatabaseValues().ToObject();
                    var clientValues = (Client)entry.Entity;
                    if (databaseValues != null)
                    {
                        // Assuming you want to reload the entity with current database values
                        _db.Entry(clientValues).CurrentValues.SetValues(databaseValues);
                        _db.SaveChanges();
                        TempData["NotifyFailed"] = "Sorry, something wrong. Please try again later.";
                    }
                    _logger.LogError(ex, $"{GetType().Name} - {MethodBase.GetCurrentMethod()?.Name} Method");
                }
            }
            catch (Exception ex)
            {
                TempData["NotifyFailed"] = "Sorry, something wrong. Please try again later.";
                _logger.LogError(ex, $"{GetType().Name} - {MethodBase.GetCurrentMethod()?.Name} Method");
            }
            return RedirectToAction("index");
        }

        public IActionResult ChangeTheme(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                id = "light";
            }
            Response.Cookies.Append("Theme", id);
            return Redirect(Request.GetTypedHeaders().Referer.ToString());
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
