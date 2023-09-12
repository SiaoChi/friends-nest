import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from '../dto/users-dto';
import { Login } from '../model/users/login.entity';
import { User } from '../model/users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Login)
    private loginRepository: Repository<Login>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<object> {
    const { name, email, password } = createUserDto;
    const isExisted = await this.userRepository.findOne({ where: { email } });

    if (isExisted) {
      throw new HttpException('email already exists', HttpStatus.CONFLICT);
    }
    try {
      // login token and userDetail are restore to different table
      const user = new User();
      user.name = name;
      user.email = email;
      const saveUser = await this.userRepository.save(user);
      const userId = saveUser.id;

      const userLogin = new Login();
      userLogin.user_id = userId;
      userLogin.name = name;
      userLogin.token = await bcrypt.hash(password, 10);
      const saveLogin = await this.loginRepository.save(userLogin);

      return { saveUser, saveLoginId: saveLogin.id };
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<object> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });
    const login = await this.loginRepository.findOne({
      where: { id: user.id },
    });

    // to be add >> add token to httpHeader
    if (user && (await login.comparePassword(password))) {
      const userId = user.id;
      const expiredTime = 60 * 60;
      const data = {
        message: 'User login successfully',
        userId,
        expiredTime,
      };
      return data;
    } else {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async findUserById(id: number): Promise<object> {
    const userInfo = await this.userRepository.findOne({ where: { id } });
    if (!userInfo)
      throw new HttpException('user id not found', HttpStatus.BAD_REQUEST);

    return userInfo;
  }
}
