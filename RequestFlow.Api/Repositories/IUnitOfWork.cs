using RequestFlow.Api.Models;

namespace RequestFlow.Api.Repositories;

public interface IUnitOfWork
{
    IRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync();
}
