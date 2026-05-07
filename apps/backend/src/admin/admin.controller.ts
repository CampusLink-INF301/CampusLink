import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

class SuspendDto {
  @IsBoolean()
  suspended!: boolean;
}

class BlockDto {
  @IsBoolean()
  blocked!: boolean;
}

type AuthRequest = { user: { id: string; role: UserRole; suspended: boolean } };

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('users')
  findUsers(@Query('page') page?: string, @Query('search') search?: string) {
    return this.service.findUsers({
      page: page ? Number(page) : undefined,
      search,
    });
  }

  @Patch('users/:id/suspend')
  suspendUser(
    @Param('id') id: string,
    @Body() dto: SuspendDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.suspendUser(id, req.user.id, dto.suspended);
  }

  @Get('opportunities')
  findOpportunities(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findOpportunities({
      page: page ? Number(page) : undefined,
      search,
    });
  }

  @Patch('opportunities/:id/block')
  blockOpportunity(@Param('id') id: string, @Body() dto: BlockDto) {
    return this.service.blockOpportunity(id, dto.blocked);
  }
}
