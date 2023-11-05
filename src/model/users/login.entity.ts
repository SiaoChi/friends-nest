import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'user_login_v2' })
export class Login {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column({ length: 55 })
  name: string;

  @Column({ length: 255 })
  token: string;

  // OneToOne relation to User.id
  @OneToOne(() => User)
  // the column name must be the same between two entity
  @JoinColumn({ name: 'user_id' })
  user: User;

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.token);
  }
}
