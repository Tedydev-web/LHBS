using System.ComponentModel.DataAnnotations;

namespace CrudNetElite.Models
{
    public class Client
    {
        [Key]
        [MaxLength(128)]
        public string Id { get; set; } = "";
        [MaxLength(256)]
        public string Name { get; set; } = "";
        [MaxLength(256)]
        public string EmailAddress { get; set; } = "";
        [MaxLength(4000)]
        public string? Notes { get; set; }
    }

    public class ClientViewModel
    {
        public string? Id { get; set; }

        [Required]
        public string Name { get; set; } = "";

        [Required]
        [EmailAddress]
        [Display(Name = "Email Address")]
        public string EmailAddress { get; set; } = "";

        //For optional fields, put a question mark to the data type.
        public string? Notes { get; set; }

    }
}
