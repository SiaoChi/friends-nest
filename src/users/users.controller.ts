import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../dto/users-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  createUser(@Body() createUserDto: CreateUserDto): object {
    const data = this.usersService.createUser(createUserDto);
    return data;
  }

  @Post('/signin')
  loginUser(@Body() loginUserDto: LoginUserDto): object {
    const data = this.usersService.loginUser(loginUserDto);
    return data;
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): object {
    // inspect if id with any character ex. 1a, 2k
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid id format');
    }

    const parsedId = parseInt(id, 10);
    const data = this.usersService.findUserById(parsedId);
    return data;
  }
}
