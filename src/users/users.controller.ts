import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/users-dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  createUser(@Body() createUserDto: CreateUserDto): object {
    const data = this.usersService.createUser(createUserDto);
    return data;
  }

  @Get('/:id')
  getUserById(@Param('id') id: number): object {
    return { id };
  }
}
