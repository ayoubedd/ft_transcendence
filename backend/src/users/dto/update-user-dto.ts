import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[a-zA-Z]*$/, { message: 'Invalid Firstname' })
  firstname?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[a-zA-Z]*$/, { message: 'Invalid Lastname' })
  lastname?: string;

  @ApiProperty()
  @MinLength(3)
  @MaxLength(15)
  @Matches(/^[a-zA-Z]+$/, { message: 'Invalid Username' })
  username?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  avatar?: string;

  @ApiProperty()
  @IsOptional()
  @MaxLength(120)
  bio?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  pub?: boolean;
}
