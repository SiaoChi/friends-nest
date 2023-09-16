import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
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
  token: string;

  expiredTime: number;
}
