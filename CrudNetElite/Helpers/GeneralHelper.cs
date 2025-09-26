
namespace CrudNetElite.Helpers
{
    public static class GeneralHelper
    {
        public static string EscapeQuotes(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            return input.Replace("'", "\\&#39;").Replace("\"", "\\&#34;");
        }
    }

}
