import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  LoginSuccessDto,
  LoginUserDto,
  UserProfileDto,
} from '../dto/users-dto';
import { Login } from '../model/users/login.entity';
import { User } from '../model/users/user.entity';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../utils/token.service';
import { S3Service } from '../utils/s3.service';
import { Tag } from '../model/users/tag.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Login)
    private loginRepository: Repository<Login>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,

    private readonly redisService: RedisService,
    private readonly tokenService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<LoginSuccessDto> {
    const { name, email, password } = createUserDto;
    const isExisted = await this.userRepository.findOne({ where: { email } });
    if (isExisted)
      throw new HttpException('email already exists', HttpStatus.CONFLICT);
    /* login and userDetail are restore to different table, 
      so to create user need to create User obj , after user.id created, and Login token will be created.*/
    const user = new User();
    user.name = name;
    user.email = email;
    const saveUser = await this.userRepository.save(user);
    const userId = saveUser.user_id;

    const userLogin = new Login();
    userLogin.user_id = userId;
    userLogin.name = name;
    userLogin.token = await bcrypt.hash(password, 10);
    await this.loginRepository.save(userLogin);
    const jwtToken = this.tokenService.generateToken(user.user_id);
    const expiredTime = this.tokenService.EXPIRE_TIME;

    return { user: saveUser, access_token: jwtToken, expiredTime };
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginSuccessDto> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();
    const login = await this.loginRepository.findOne({
      where: { user_id: user.user_id },
    });
    const isValid = await login.comparePassword(password);
    if (!isValid) throw new UnauthorizedException();

    const jwtToken = this.tokenService.generateToken(user.user_id);
    const expiredTime = this.tokenService.EXPIRE_TIME;
    return { user, access_token: jwtToken, expiredTime };
  }

  async findUserById(user_id: string): Promise<object> {
    const redisFindUser = await this.redisService.getValue(
      `userId_profile_${user_id}`,
    );
    if (redisFindUser) {
      const userObject = JSON.parse(redisFindUser);
      return userObject;
    }
    const userInfo = await this.userRepository.findOne({
      where: { user_id },
      relations: ['tags'],
    });
    if (!userInfo)
      throw new HttpException('user id not found', HttpStatus.BAD_REQUEST);

    return userInfo;
  }

  async updateUserProfile(body: UserProfileDto, file: object): Promise<object> {
    const {
      user_id,
      name,
      email,
      birth,
      location,
      sick_year,
      hospital,
      level,
      carer,
      curr_problem,
      tags,
    } = body;

    let { pictureUrl } = body;

    const userInfo = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!userInfo)
      throw new HttpException('user id not found', HttpStatus.BAD_REQUEST);

    /* there are three scenarios for file
    1. user upload file 
    2. user choose default pictureURL
    3. user didn't change any picture, it would only upload the original URL from database
    */

    // meet (1) senario
    if (file) {
      const fileResponse = await this.s3Service.uploadUserPicture(file);
      pictureUrl = fileResponse.Location;
      userInfo.picture = pictureUrl;
    }

    // meet (2,3) senario
    if (!file && pictureUrl) {
      userInfo.picture = pictureUrl;
    }

    userInfo.name = name;
    userInfo.email = email;
    userInfo.birth = birth;
    userInfo.location = location;
    userInfo.sick_year = sick_year;
    userInfo.hospital = hospital;
    userInfo.level = level;
    userInfo.carer = carer;
    userInfo.curr_problem = curr_problem;
    const userInfoSave = await this.userRepository.save(userInfo);
    await this.saveUserTags(userInfo.user_id, tags);
    const expiredTime = 60 * 60 * 24 * 30;
    await this.redisService.setValue(
      `userId_profile_${user_id}`,
      JSON.stringify(userInfoSave),
      expiredTime,
    );
    return userInfoSave;
  }

  async saveUserTags(user_id: string, tagIds: any): Promise<object> {
    if (tagIds && tagIds.length > 0) {
      const userToUpdate = await this.userRepository.findOne({
        where: { user_id },
      });

      if (userToUpdate) {
        const newTagsObj = await this.tagRepository.find({
          where: { tag_id: In(tagIds) },
        });

        userToUpdate.tags = newTagsObj;
        const result = await this.userRepository.save(userToUpdate);
        return result;
      }
    }
  }

  async findUserTags(user_id: string): Promise<object> {
    const userTag = await this.userRepository.find({
      relations: ['tags'],
      select: ['user_id'],
      where: { user_id },
    });

    return userTag;
  }
}
