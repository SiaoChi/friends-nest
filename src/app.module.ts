import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/databse.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './users/user.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    // the reference of CacheModule add redis (https://github.com/dabroek/node-cache-manager-redis-store/issues/40)
    CacheModule.register({
      isGlobal: true,
      // this '@ts-ignore' is required for redis v4 config, due to the original version not support v4
      // @ts-ignore
      store: async () =>
        await redisStore({
          // after redis upgrade to v4 the property need to be set in socket object
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
    }),
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
