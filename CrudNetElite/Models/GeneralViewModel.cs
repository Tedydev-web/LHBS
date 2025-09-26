using Microsoft.AspNetCore.Mvc.Rendering;

namespace CrudNetElite.Models
{
    public class TableLengthViewModel
    {
        public List<SelectListItem> Options { get; set; } = new List<SelectListItem>();
        public string SearchPlaceholder { get; set; } = "Search...";
    }

    public class ExportTableViewModel
    {
        public string TableId { get; set; } = "";
        /// <summary>
        /// Determines the PDF layout. Set to true for Portrait mode, false for Landscape mode.
        /// </summary>
        public bool IsPortrait { get; set; } = true;
    }
}
