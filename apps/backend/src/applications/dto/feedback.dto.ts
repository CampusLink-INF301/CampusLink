import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  feedback: string;
}
