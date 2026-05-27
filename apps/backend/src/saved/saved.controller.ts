import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SavedService } from './saved.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

type AuthRequest = { user: { id: string; role: UserRole } };

@Controller('saved')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ESTUDIANTE)
export class SavedController {
  constructor(private readonly service: SavedService) {}

  @Get()
  findMine(@Request() req: AuthRequest) {
    return this.service.findMine(req.user.id);
  }

  @Get('ids')
  getSavedIds(@Request() req: AuthRequest) {
    return this.service.getSavedIds(req.user.id);
  }

  @Post(':opportunityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  save(
    @Param('opportunityId') id: string,
    @Request() req: AuthRequest,
  ): Promise<void> {
    return this.service.save(req.user.id, id);
  }

  @Delete(':opportunityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unsave(
    @Param('opportunityId') id: string,
    @Request() req: AuthRequest,
  ): Promise<void> {
    return this.service.unsave(req.user.id, id);
  }
}
