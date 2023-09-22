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
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../utils/token.service';
import { UserTag } from '../model/users/user.tag.entity';
import { S3Service } from '../utils/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Login)
    private loginRepository: Repository<Login>,
    @InjectRepository(UserTag)
    private userTagRepository: Repository<UserTag>,
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
    const userInfo = await this.userRepository.findOne({
      where: { user_id },
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

    let { picture } = body;

    const userInfo = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!userInfo)
      throw new HttpException('user id not found', HttpStatus.BAD_REQUEST);

    if (file) {
      const fileResponse = await this.s3Service.uploadFile(file);
      picture = fileResponse.Location;
      userInfo.picture = picture;
    }

    if (!file && picture) {
      userInfo.picture = picture;
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
    return userInfoSave;
  }

  async saveUserTags(user_id: string, tagIds: number[]): Promise<void> {
    if (tagIds && tagIds.length > 0) {
      // 先刪除現有的關聯
      await this.userTagRepository.delete({ user_id });

      // 創建新的關聯
      const userTagData = tagIds.map((tag_id) => ({
        user_id,
        tag_id,
      }));

      const userTagEntities = userTagData.map((data) => {
        const userTag = new UserTag();
        userTag.user_id = data.user_id;
        userTag.tag_id = data.tag_id;
        return userTag;
      });

      // 目前是return rowID
      await this.userTagRepository.insert(userTagEntities);
    }
  }

  async findUserTags(user_id: string): Promise<object> {
    const userTags = await this.userTagRepository.find({
      // 未知，沒加入relations就無法得到tag_id資料
      // relations: ['tag_id'],
      where: { user_id },
    });
    console.log(userTags);
    const tagsArray = userTags.map((item) => {
      return item.tag_id;
    });

    return { userId: user_id, tagsArray };
  }
}
