import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OpportunityType } from '../entities/opportunity.entity';

export class QueryOpportunityDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;
}
