using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Interfaces.DA;
using Abstracciones.Interfaces.Flujo;
using Abstracciones.Modelos.History;


namespace Flujo
{
    public class HistoryFlujo : IHistoryFlujo
    {
        private readonly IHistoryDA _historyDA;

        public HistoryFlujo(IHistoryDA historyDA)
        {
            _historyDA = historyDA;
        }

        public async Task<IEnumerable<CompletedTaskHistoryDto>> GetHistoryAsync(HistoryFilterRequest filter)
        {
            // Basic validation: date range must be valid
            if (filter.DateFrom.HasValue && filter.DateTo.HasValue && filter.DateFrom > filter.DateTo)
                throw new ArgumentException("DateFrom cannot be greater than DateTo.");

            return await _historyDA.GetHistoryAsync(filter);
        }
    }
}