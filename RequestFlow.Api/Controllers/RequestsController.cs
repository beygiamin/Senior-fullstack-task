using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RequestFlow.Api.Contracts;
using RequestFlow.Api.Models;
using RequestFlow.Api.Repositories;
using RequestFlow.Api.Services;

namespace RequestFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RequestsController(
    IUnitOfWork unitOfWork,
    UserManager<ApplicationUser> userManager,
    RequestRoutingService requestRoutingService) : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly RequestRoutingService _requestRoutingService = requestRoutingService;

    [Authorize(Roles = RoleNames.Employee)]
    [HttpPost]
    public async Task<ActionResult<RequestListItem>> Create([FromBody] CreateRequestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest("Title is required.");
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero.");
        }

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var assignedRole = _requestRoutingService.DetermineAssignedRole(request.Amount);
        var entity = new RequestEntity
        {
            Title = request.Title.Trim(),
            Amount = request.Amount,
            Description = request.Description.Trim(),
            CreatedByUserId = userId,
            AssignedRole = assignedRole,
            Status = RequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Repository<RequestEntity>().Add(entity);
        await _unitOfWork.SaveChangesAsync();

        return Ok(MapToResponse(entity));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RequestListItem>>> GetAll()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var requests = (await _unitOfWork.Repository<RequestEntity>().GetAllAsync())
            .Cast<RequestEntity>()
            .Where(x => x.CreatedByUserId == user.Id || roles.Contains(x.AssignedRole, StringComparer.OrdinalIgnoreCase))
            .OrderByDescending(x => x.CreatedAt)
            .ToList();

        return Ok(requests.Select(MapToResponse));
    }

    [HttpPut("{id:guid}/review")]
    public async Task<ActionResult<RequestListItem>> Review(Guid id, [FromBody] ReviewRequestRequest request)
    {
        var entity = await _unitOfWork.Repository<RequestEntity>().GetByIdAsync(id);
        if (entity is null)
        {
            return NotFound();
        }

        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userRole = roles.FirstOrDefault(role => string.Equals(role, entity.AssignedRole, StringComparison.OrdinalIgnoreCase));
        if (string.IsNullOrEmpty(userRole))
        {
            return Forbid();
        }

        if (!Enum.IsDefined(typeof(ReviewDecision), request.Decision))
        {
            return BadRequest("Decision must be 'Approved' or 'Rejected'.");
        }

        if (entity.Status != RequestStatus.Pending)
        {
            return Conflict("This request has already been processed.");
        }

        entity.Status = request.Decision switch
        {
            ReviewDecision.Approved => RequestStatus.Approved,
            ReviewDecision.Rejected => RequestStatus.Rejected,
            _ => throw new InvalidOperationException("Unsupported review decision.")
        };

        _unitOfWork.Repository<RequestEntity>().Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return Ok(MapToResponse(entity));
    }

    private static RequestListItem MapToResponse(RequestEntity request)
    {
        return new RequestListItem
        {
            Id = request.Id,
            Title = request.Title,
            Amount = request.Amount,
            Description = request.Description,
            Status = request.Status.ToString(),
            CreatedByUserId = request.CreatedByUserId,
            AssignedRole = request.AssignedRole,
            CreatedAt = request.CreatedAt
        };
    }
}
