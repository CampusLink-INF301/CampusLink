import { IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  opportunityId: string;

  @IsOptional()
  @IsObject()
  formResponses?: Record<string, string | string[]>;
}
