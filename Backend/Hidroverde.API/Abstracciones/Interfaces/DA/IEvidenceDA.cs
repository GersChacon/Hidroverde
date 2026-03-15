namespace Abstracciones.Interfaces.DA
{
    public interface IEvidenceDA
    {
        Task<int> SaveEvidenceAsync(int taskId, int empleadoId, string fileName, string filePath, string? notes);
    }
}