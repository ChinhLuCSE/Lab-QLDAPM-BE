import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignupAuthDto {
  @ApiProperty({ example: 'johncena', type: String })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password', type: String })
  @IsString()
  @IsNotEmpty()
  password: string;
}
