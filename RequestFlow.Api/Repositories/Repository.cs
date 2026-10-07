using Microsoft.EntityFrameworkCore;
using RequestFlow.Api.Data;

namespace RequestFlow.Api.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext Context;
    protected readonly DbSet<T> DbSet;

    public Repository(ApplicationDbContext context)
    {
        Context = context;
        DbSet = context.Set<T>();
    }

    public IQueryable<T> Query() => DbSet.AsQueryable();

    public Task<T?> GetByIdAsync(Guid id) => DbSet.FindAsync(id).AsTask();

    public async Task<IEnumerable<T>> GetAllAsync() => await DbSet.AsNoTracking().ToListAsync();

    public void Add(T entity) => DbSet.Add(entity);

    public void Update(T entity) => DbSet.Update(entity);

    public void Delete(T entity) => DbSet.Remove(entity);
}
