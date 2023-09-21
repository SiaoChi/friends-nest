import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: 'Password must contain at least one letter and one number',
  })
  readonly password: string;
}

export class LoginUserDto {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class LoginSuccessDto {
  user: object;

  @IsString()
  access_token: string;

  expiredTime: number;
}

export class UserProfileDto {
  @IsString()
  user_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsString()
  birth: Date;

  @IsOptional()
  @IsString()
  picture: string;

  @IsOptional()
  @IsString()
  location: string;

  @IsOptional()
  sick_year: number;

  @IsOptional()
  @IsString()
  hospital: string;

  @IsOptional()
  @IsString()
  level: string;

  @IsOptional()
  @IsString()
  carer: string;

  @IsOptional()
  @IsString()
  curr_problem: string;

  @IsOptional()
  tags: number[] | null;
}
