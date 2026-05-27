import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FinalizeOpportunityDto } from './dto/finalize-opportunity.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { QueryApplicationDto } from './dto/query-application.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

type AuthRequest = { user: { id: string; role: UserRole; suspended: boolean } };

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ESTUDIANTE)
  apply(@Body() dto: CreateApplicationDto, @Request() req: AuthRequest) {
    return this.service.apply(req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ESTUDIANTE)
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@Param('id') id: string, @Request() req: AuthRequest): Promise<void> {
    return this.service.cancel(req.user.id, id);
  }

  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ESTUDIANTE)
  getMyApplications(
    @Request() req: AuthRequest,
    @Query() dto: QueryApplicationDto,
  ) {
    return this.service.findByUser(req.user.id, dto);
  }

  @Get('by-opportunity/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION)
  getByOpportunity(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.findByOpportunity(id, req.user.id);
  }

  @Post('finalize/:opportunityId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION)
  @HttpCode(HttpStatus.NO_CONTENT)
  finalize(
    @Param('opportunityId') opportunityId: string,
    @Body() dto: FinalizeOpportunityDto,
    @Request() req: AuthRequest,
  ): Promise<void> {
    return this.service.finalize(opportunityId, req.user.id, dto);
  }

  @Put(':id/feedback')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION)
  setFeedback(
    @Param('id') id: string,
    @Body() dto: FeedbackDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.setFeedback(id, req.user.id, dto);
  }

  @Get('mine/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ESTUDIANTE)
  getStats(@Request() req: AuthRequest) {
    return this.service.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.findOne(req.user.id, id);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.getMessages(req.user.id, id);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.sendMessage(req.user.id, id, dto);
  }
}
