import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../model/users/user.entity';
import { Login } from '../model/users/login.entity';
import { Tag } from '../model/users/tag.entity';
import { AuthService } from '../utils/token.service';
import { S3Service } from '../utils/s3.service';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../redis/redis.module';

@Module({
  // app.module has root connection, but for each database must import 'TypeOrmModule.forFeature([entityName])'
  imports: [
    RedisModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: '60m' },
    }),
    TypeOrmModule.forFeature([User, Login, Tag]),
  ],
  providers: [UsersService, AuthService, S3Service],
  controllers: [UsersController],
})
export class UsersModule {}
