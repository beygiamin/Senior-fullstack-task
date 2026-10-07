import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppConfig } from '@/app/providers/appConfigContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '../../auth/hooks/useAuth';
import { getErrorMessage } from '@/lib/http/client';
import { useRequests, useReviewRequest } from '../hooks/useRequests';
import type { RequestItem } from '../types/request';
import { canReviewRequest } from '../utils/requestAccess';

const statusLabels: Record<RequestItem['status'], string> = {
  Pending: 'در انتظار',
  Approved: 'تأیید شده',
  Rejected: 'رد شده',
};

function RequestStatusBadge({ status }: { status: RequestItem['status'] }) {
  return (
    <Badge variant="outline" className={`status-${status.toLowerCase()}`}>
      {statusLabels[status]}
    </Badge>
  );
}

export function RequestsPage() {
  const { roleLabels } = useAppConfig();
  const { user } = useAuth();
  const { data = [], isPending, isError, error } = useRequests();
  const reviewMutation = useReviewRequest();
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);

  const handleReview = (request: RequestItem, decision: 'Approved' | 'Rejected') => {
    if (pendingReviewId === request.id || !canReviewRequest(request, user)) {
      return;
    }

    setPendingReviewId(request.id);
    reviewMutation.mutate(
      { id: request.id, decision },
      {
        onSettled: () => setPendingReviewId(null),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="page-heading">
        <div>
          <p className="eyebrow">نمای کلی</p>
          <CardTitle role="heading" aria-level={1} className="text-2xl">
            درخواست‌ها
          </CardTitle>
          <CardDescription>درخواست‌های ثبت‌شده و موارد نیازمند بررسی.</CardDescription>
        </div>
        <Button render={<Link to="/requests/new" />} nativeButton={false}>
          ثبت درخواست
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {reviewMutation.isError ? (
          <Alert variant="destructive">
            <AlertTitle>بررسی درخواست ناموفق بود</AlertTitle>
            <AlertDescription>{getErrorMessage(reviewMutation.error)}</AlertDescription>
          </Alert>
        ) : null}

        {isPending ? (
          <div className="flex flex-col gap-3" aria-label="در حال بارگذاری درخواست‌ها">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertTitle>بارگذاری درخواست‌ها ناموفق بود</AlertTitle>
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>
        ) : data.length === 0 ? (
          <Empty className="border border-dashed border-border">
            <EmptyHeader>
              <EmptyTitle>درخواستی پیدا نشد</EmptyTitle>
              <EmptyDescription>در حال حاضر درخواستی برای نمایش وجود ندارد.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" render={<Link to="/requests/new" />} nativeButton={false}>
              ثبت اولین درخواست
            </Button>
          </Empty>
        ) : (
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>نقش بررسی‌کننده</TableHead>
                  <TableHead>تاریخ ایجاد</TableHead>
                  <TableHead>توضیحات</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{`${request.amount.toLocaleString('fa-IR')} تومان`}</TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="role-badge">
                        {roleLabels[request.assignedRole]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>{request.description || '—'}</TableCell>
                    <TableCell>
                      {canReviewRequest(request, user) ? (
                        <div className="review-actions">
                          <Button
                            size="sm"
                            disabled={pendingReviewId === request.id || reviewMutation.isPending}
                            onClick={() => handleReview(request, 'Approved')}
                          >
                            {pendingReviewId === request.id ? 'در حال پردازش...' : 'تأیید'}
                          </Button>
                          <AlertDialog
                            open={rejectingRequestId === request.id}
                            onOpenChange={(open) =>
                              setRejectingRequestId(open ? request.id : null)
                            }
                          >
                            <AlertDialogTrigger
                              render={
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={pendingReviewId === request.id || reviewMutation.isPending}
                                />
                              }
                            >
                              رد
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>رد این درخواست؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  درخواست «{request.title}» رد می‌شود. این عملیات را نمی‌توان لغو کرد.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>بازگشت</AlertDialogCancel>
                                <Button
                                  variant="destructive"
                                  disabled={reviewMutation.isPending}
                                  onClick={() => {
                                    setRejectingRequestId(null);
                                    handleReview(request, 'Rejected');
                                  }}
                                >
                                  تأیید رد درخواست
                                </Button>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">بدون عملیات</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
