using RequestFlow.Api.Data;
using RequestFlow.Api.Models;

namespace RequestFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Requests = new Repository<RequestEntity>(_context);
    }

    public IRepository<RequestEntity> Requests { get; }

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}
