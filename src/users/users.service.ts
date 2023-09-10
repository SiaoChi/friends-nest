import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/users-dto';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<object> {
    const { name, email, password } = createUserDto;
    const isExisted = await this.userRepository.findOne({ where: { email } });

    if (isExisted) {
      throw new HttpException('email already exists', HttpStatus.CONFLICT);
    }

    // 此處需創建兩個instance 1.userLogin 2.userDetails

    return { name, email, password };
  }
}
