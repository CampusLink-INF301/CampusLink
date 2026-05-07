import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OpportunityType } from '../../opportunities/entities/opportunity.entity';
import { ApplicationStatus } from '../entities/application.entity';

export class QueryApplicationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
