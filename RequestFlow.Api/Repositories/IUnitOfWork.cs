using RequestFlow.Api.Models;

namespace RequestFlow.Api.Repositories;

public interface IUnitOfWork
{
    IRepository<RequestEntity> Requests { get; }
    Task<int> SaveChangesAsync();
}
