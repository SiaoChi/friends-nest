import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto, UserProfileDto } from '../dto/users-dto';
import { UsersService } from './users.service';
import { Response, Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../utils/s3.service';
import { Public } from './user.guard';
import { request } from 'http';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
  ) {}

  @Public()
  @Post('signup')
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<object> {
    const data = await this.usersService.createUser(createUserDto);
    const { access_token } = data;
    res.header('Authorization', `Bearer ${access_token}`);
    return res.status(HttpStatus.OK).json(data);
  }

  @Public()
  @Post('signin')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<object> {
    const data = await this.usersService.login(loginUserDto);
    const { access_token } = data;
    res.header('Authorization', `Bearer ${access_token}`);
    return res.status(HttpStatus.OK).json(data);
  }

  @Get('tag')
  async findUserTags(@Req() request): Promise<object> {
    const userId = request.user.userId;
    console.log(userId);
    const data = this.usersService.findUserTags(userId);
    // console.log(data);
    return data;
  }

  @Public()
  @Get(':id')
  getUserById(@Param('id') id: string): object {
    const data = this.usersService.findUserById(id);
    return data;
  }

  @Post('profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfile(
    @Body() body: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 3,
          }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const result = await this.usersService.updateUserProfile(body, file);
    return result;
  }
}
