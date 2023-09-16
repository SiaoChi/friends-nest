import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginSuccessDto, LoginUserDto } from '../dto/users-dto';
import { Login } from '../model/users/login.entity';
import { User } from '../model/users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../utils/token.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Login)
    private loginRepository: Repository<Login>,
    private readonly tokenService: TokenService,
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
    const jwtToken = this.tokenService.generateToken({ id: user.user_id });
    const expiredTime = this.tokenService.EXPIRE_TIME;

    return { user: saveUser, token: jwtToken, expiredTime };
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginSuccessDto> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user)
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    const login = await this.loginRepository.findOne({
      where: { user_id: user.user_id },
    });
    const isValid = await login.comparePassword(password);
    if (!isValid)
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );

    const jwtToken = this.tokenService.generateToken({
      id: user.user_id,
    });
    const expiredTime = this.tokenService.EXPIRE_TIME;
    return { user, token: jwtToken, expiredTime };
  }

  async findUserById(id: string): Promise<object> {
    const userInfo = await this.userRepository.findOne({
      where: { user_id: id },
    });
    if (!userInfo)
      throw new HttpException('user id not found', HttpStatus.BAD_REQUEST);

    return userInfo;
  }
}
