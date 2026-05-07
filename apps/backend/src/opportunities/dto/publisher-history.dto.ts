import {
  IsEnum,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  OpportunityType,
  OpportunityStatus,
} from '../entities/opportunity.entity';

export class PublisherHistoryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsIn(['createdAt', 'deadline', 'status'])
  sortBy?: 'createdAt' | 'deadline' | 'status';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}
