import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from '../utils/token.service';
import { S3Service } from '../utils/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../model/users/user.entity';
import { Login } from '../model/users/login.entity';
import { Tag } from '../model/users/tag.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto, LoginSuccessDto, LoginUserDto } from '../dto/users-dto';
import { HttpStatus } from '@nestjs/common';

class RepositoryMock {
  findOne = jest.fn();
  save = jest.fn();
  find = jest.fn();
  setNX = jest.fn();
}

describe('UsersService', () => {
  let service: UsersService;
  let controller: UsersController;
  let userRepo: RepositoryMock;
  let loginRepo: RepositoryMock;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        S3Service,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: () => 'any value',
            set: () => jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: RepositoryMock,
        },
        {
          provide: getRepositoryToken(Login),
          useClass: RepositoryMock,
        },
        {
          provide: getRepositoryToken(Tag),
          useClass: RepositoryMock,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
    userRepo = module.get(getRepositoryToken(User));
    loginRepo = module.get(getRepositoryToken(Login));
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  const createUserDto: CreateUserDto = {
    name: 'test',
    email: 'test1@gmail.com',
    password: 'a11111111',
  };
  const loginSuccessDto: LoginSuccessDto = {
    user: new User(),
    access_token: 'token',
    expiredTime: 6480000,
  };

  const loginUserDto: LoginUserDto = {
    email: 'test@com',
    password: '1223',
  };

  it('createUser if email existed throw error message', async () => {
    userRepo.findOne.mockResolvedValue({ email: createUserDto.email });
    try {
      await service.createUser(createUserDto);
    } catch (err) {
      expect(err.message).toBe('email already exists');
      expect(err.status).toBe(HttpStatus.CONFLICT);
    }
  });

  it('createUser successfully return <LoginSuccessDto>', async () => {
    // 模擬generateToken方法，返回預設的access_token
    jest
      .spyOn(authService, 'generateToken')
      .mockReturnValue(loginSuccessDto.access_token);

    // 模擬userRepo.save方法，返回預設的user對象
    const spyOnSave = jest
      .spyOn(userRepo, 'save')
      .mockResolvedValue(loginSuccessDto.user);

    // 執行createUser方法
    const data = await service.createUser(createUserDto);

    // 斷言確保返回的data與loginSuccessDto相等
    expect(data).toEqual(loginSuccessDto);

    // 斷言檢查模擬函數的調用情況
    expect(spyOnSave).toBeCalledTimes(1);
    expect(authService.generateToken).toHaveBeenCalledWith(
      loginSuccessDto.user.user_id,
    );
    expect(authService.generateToken('userId')).toBe(
      loginSuccessDto.access_token,
    );
  });

  it('login with loginDto successfully', async () => {
    const user = new User();
    const login = {
      comparePassword: jest.fn(),
    };
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(loginRepo, 'findOne').mockResolvedValue(login);
    jest.spyOn(login, 'comparePassword').mockResolvedValue(true);
    jest
      .spyOn(authService, 'generateToken')
      .mockReturnValue(loginSuccessDto.access_token);
    expect(await service.login(loginUserDto)).toEqual(loginSuccessDto);
  });

  it('login with wrong password , Unauthorized 401 ', async () => {
    const user = new User();
    const login = {
      comparePassword: jest.fn(),
    };
    jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);
    jest.spyOn(loginRepo, 'findOne').mockResolvedValue(login);
    jest.spyOn(login, 'comparePassword').mockResolvedValue(false);
    try {
      await service.login(loginUserDto);
    } catch (err) {
      expect(err.message).toBe('Unauthorized');
      expect(err.status).toBe(401);
    }
  });
});
