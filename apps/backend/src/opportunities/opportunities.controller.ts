import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunityDto } from './dto/query-opportunity.dto';
import { PublisherHistoryDto } from './dto/publisher-history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

type AuthRequest = { user: { id: string; role: UserRole; suspended: boolean } };

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly service: OpportunitiesService) {}

  @Get()
  findAll(@Query() query: QueryOpportunityDto) {
    return this.service.findAvailable(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  findMine(@Query() dto: PublisherHistoryDto, @Request() req: AuthRequest) {
    return this.service.findByPublisher(req.user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  create(@Body() dto: CreateOpportunityDto, @Request() req: AuthRequest) {
    return this.service.create(dto, req.user.id, req.user.role);
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  clone(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.clone(id, req.user.id, req.user.role);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
    @Request() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.remove(id, req.user.id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCENTE, UserRole.INSTITUCION, UserRole.ESTUDIANTE)
  @HttpCode(HttpStatus.NO_CONTENT)
  closeApplications(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.closeApplications(id, req.user.id);
  }
}
