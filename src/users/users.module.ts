import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../model/users/user.entity';
import { Login } from '../model/users/login.entity';

@Module({
  // app.module has root connection, but for each database must import 'TypeOrmModule.forFeature([entityName])'
  imports: [TypeOrmModule.forFeature([User, Login])],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
