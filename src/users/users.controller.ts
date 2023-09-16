import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../dto/users-dto';
import { UsersService } from './users.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<object> {
    const data = await this.usersService.createUser(createUserDto);
    const { token } = data;
    res.header('Authorization', `Bearer ${token}`);
    console.log(data);
    return res.status(HttpStatus.OK).json(data);
  }

  @Post('/signin')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<object> {
    const data = await this.usersService.login(loginUserDto);
    const { token } = data;
    res.header('Authorization', `Bearer ${token}`);
    return res.status(HttpStatus.OK).json(data);
  }

  @Get('/:id')
  getUserById(@Param('id') id: string): object {
    const data = this.usersService.findUserById(id);
    return data;
  }
}
