using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Abstracciones.Modelos.History;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Abstracciones.Interfaces.DA
{
    public interface IHistoryDA
    {
        Task<IEnumerable<CompletedTaskHistoryDto>> GetHistoryAsync(HistoryFilterRequest filter);
    }
}