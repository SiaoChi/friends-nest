import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../model/users/user.entity';
import { Login } from '../model/users/login.entity';
import { AuthService } from '../utils/token.service';
import { CreateUserDto, LoginUserDto } from '../dto/users-dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { UserTag } from '../model/users/user.tag.entity';
import { S3Service } from '../utils/s3.service';
import { JwtService } from '@nestjs/jwt';

class RepositoryMock {}

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  // before test, make sure all providers about the controller environment must be setting up
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        S3Service,
        {
          provide: getRepositoryToken(User),
          useClass: RepositoryMock,
        },
        {
          provide: getRepositoryToken(Login),
          useClass: RepositoryMock,
        },
        {
          provide: getRepositoryToken(UserTag),
          useClass: RepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  describe('user function test', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    const createUserDto: CreateUserDto = {
      name: 'test',
      email: 'test1@gmail.com',
      password: 'a11111111',
    };

    const userSignInRes = {
      user: {
        user_id: '6d399f0d-b763-4dd2-ba60-fca3e264d93a',
        name: 'test',
        email: 'test1@gmail.com',
        picture: null,
        birth: null,
        location: null,
        sick_year: null,
        hospital: null,
        level: null,
        carer: null,
        curr_problem: null,
        created_at: '2023-09-14T05:39:15.000Z',
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      expiredTime: 216000,
    };

    const loginUserDto: LoginUserDto = {
      email: 'test1@gmail.com',
      password: 'a11111111',
    };

    const responseMock = {
      // status is a chaining response which need to use mockReturnThis() to return entire object
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      header: jest.fn(),
    } as unknown as Response; // unknown means to force this object to be a Response type which setting for typescript

    it('POST /users/signup', async () => {
      // due to the unit test will test controller function, the priority of spyOn service is important to mock service function first then call controller function
      jest.spyOn(service, 'createUser').mockResolvedValue(userSignInRes);
      await controller.createUser(createUserDto, responseMock);

      const data = await service.createUser(createUserDto);
      expect(data).toBe(userSignInRes);
      expect(responseMock.header).toHaveBeenCalledWith(
        'Authorization',
        `Bearer ${userSignInRes.token}`,
      );
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.json).toHaveBeenCalledWith(userSignInRes);
    });

    it('POST /users/signin', async () => {
      jest.spyOn(service, 'login').mockResolvedValue(userSignInRes);
      await controller.loginUser(loginUserDto, responseMock);

      const data = await service.login(loginUserDto);
      expect(data).toBe(userSignInRes);
      expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(responseMock.json).toHaveBeenCalledWith(userSignInRes);
    });

    it('GET /users/:id successfully', async () => {
      jest.spyOn(service, 'findUserById').mockResolvedValue(userSignInRes);
      const data = await service.login(loginUserDto);
      expect(data).toBe(userSignInRes);
    });

    it('GET /users/:id successful', async () => {
      jest.spyOn(service, 'findUserById').mockResolvedValue(userSignInRes);
      const data = await service.login(loginUserDto);
      expect(data).toBe(userSignInRes);
    });

    it('GET /users/:id failed', async () => {
      const errorMsg = 'user id not found';

      jest.spyOn(service, 'findUserById').mockRejectedValue(errorMsg);
      try {
        await service.login(loginUserDto);
      } catch (err) {
        expect(err).toBe(errorMsg);
        expect(err.HttpStatus).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
