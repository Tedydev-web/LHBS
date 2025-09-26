using Microsoft.EntityFrameworkCore;

namespace CrudNetElite.Helpers
{
    public class PaginatedList<T> : List<T>
    {
        //private set; means that the properties will be read-only for any code outside the class, while still allowing the class's internal methods to update them
        
        /// <summary>
        /// Represents the current page number in a paginated set. 
        /// This value indicates whether the user is on page 1, page 2, page 3, etc.
        /// </summary>
        public int PageIndex { get; private set; }
        public int TotalPages { get; private set; }
        public int PageSize { get; private set; }
        public int TotalItems { get; private set; }
        public string SearchMessage { get; private set; }
        public List<ColumnHeader> ColumnHeaders { get; private set; }

        public PaginatedList(List<T> items, int count, int pageIndex, int pageSize, int total, List<ColumnHeader> headers, string searchMessage)
        {
            PageIndex = pageIndex;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);
            PageSize = pageSize;
            TotalItems = total;
            ColumnHeaders = headers;
            SearchMessage = searchMessage;
            this.AddRange(items);
        }

        public bool HasPreviousPage => PageIndex > 1;

        public bool HasNextPage => PageIndex < TotalPages;

        public static async Task<PaginatedList<T>> CreateAsync(IQueryable<T> source, int pageIndex, int pageSize, int total, List<ColumnHeader> headers, string searchMessage)
        {
            var count = await source.CountAsync();
            var items = await source.Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return new PaginatedList<T>(items, count, pageIndex, pageSize, total, headers, searchMessage);
        }
    }

    /// <summary>
    /// Storing a column's properties
    /// </summary>
    public class ColumnHeader
    {
        /// <summary>
        /// The column's title is to be displayed on the table.
        /// </summary>
        public string Title { get; set; } = "";
        /// <summary>
        /// Specifies the sorting order for the column. Append '-asc' for ascending order or '-desc' for descending order. For example, 'TicketTitle-asc' sorts by ticket title in ascending order,while 'TicketTitle-desc' sorts by ticket title in descending order.
        /// </summary>
        public string OrderAction { get; set; } = "asc";
        /// <summary>
        /// The index of the column, starting from 1.
        /// </summary>
        public int Index { get; set; }
        /// <summary>
        /// The key representing the field name of the column. Avoid using spaces in the key.
        /// </summary>
        public string Key { get; set; } = "";
        /// <summary>
        /// Indicates whether the column is sortable. For example, columns containing interactive elements such as edit and delete buttons are not sortable and should be set to false so that the user cannot apply sort action to the column.
        /// </summary>
        public bool Sortable { get; set; }
        /// <summary>
        /// Indicates whether the column is exportable to PDF. For example, columns containing interactive elements such as edit/delete buttons are not exportable and should be set to false.
        /// </summary>
        public bool Exportable { get; set; }
    }

}
