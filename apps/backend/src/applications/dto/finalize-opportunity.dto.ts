import { IsArray, IsUUID } from 'class-validator';

export class FinalizeOpportunityDto {
  @IsArray()
  @IsUUID('4', { each: true })
  acceptedApplicationIds: string[];
}
