import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';

type AuthRequest = { user: { id: string; role: UserRole } };

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.service.findForUser(req.user.id);
  }

  @Get('unread-count')
  unreadCount(@Request() req: AuthRequest) {
    return this.service.countUnread(req.user.id).then((count) => ({ count }));
  }

  @Patch('read-all')
  markAllRead(@Request() req: AuthRequest) {
    return this.service.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.markRead(id, req.user.id);
  }
}
