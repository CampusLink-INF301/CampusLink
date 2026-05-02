import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  apply(@Body() dto: CreateApplicationDto, @Request() req: { user: { id: string } }) {
    return this.service.apply(req.user.id, dto);
  }

  @Get('mine')
  getMyApplications(@Request() req: { user: { id: string } }) {
    return this.service.findByUser(req.user.id);
  }
}
