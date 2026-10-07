using RequestFlow.Api.Data;

namespace RequestFlow.Api.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<T> Repository<T>() where T : class => new Repository<T>(_context);

    public Task<int> SaveChangesAsync() => _context.SaveChangesAsync();
}
