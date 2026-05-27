import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(1, { message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, { message: 'El mensaje no puede superar los 1000 caracteres' })
  content: string;
}
