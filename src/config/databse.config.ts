import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// package.json has to install mysql2 and mysql must be deleted.
const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '',
  database: 'friends_nest',
  autoLoadEntities: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
};

export default databaseConfig;
