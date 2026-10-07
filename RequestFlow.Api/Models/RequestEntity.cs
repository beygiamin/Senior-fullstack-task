namespace RequestFlow.Api.Models;

public class RequestEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public RequestStatus Status { get; set; } = RequestStatus.Pending;
    public string CreatedByUserId { get; set; } = string.Empty;
    public string AssignedRole { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
