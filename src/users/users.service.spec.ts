import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from '../utils/token.service';
import { S3Service } from '../utils/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../model/users/user.entity';
import { Login } from '../model/users/login.entity';
import { UserTag } from '../model/users/user.tag.entity';
import { Tag } from '../model/users/tag.entity';

class RepositoryMock {}

describe('UsersService', () => {
  let service: UsersService;
  let controller: UsersController;

  beforeEach(async () => {
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
        {
          provide: getRepositoryToken(Tag),
          useClass: RepositoryMock,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
