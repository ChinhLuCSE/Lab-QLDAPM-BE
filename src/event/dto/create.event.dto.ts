import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class CreateEventDTO {
  @ApiProperty({ example: 'Hoạt động 1', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Hoạt động ngoại khóa tại trường ĐHBK',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: new Date(), type: Date })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: new Date(), type: Date })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
