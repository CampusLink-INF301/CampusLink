import { IsString, MaxLength } from 'class-validator';

export class FeedbackDto {
  @IsString()
  @MaxLength(2000)
  feedback: string;
}
