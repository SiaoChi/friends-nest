import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_login_v1' })
export class Login {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 55 })
  name: string;

  @Column({ length: 255 })
  token: string;

  @Column()
  user_id: number;

  // OneToOne relation to User.id
  @OneToOne(() => User)
  @JoinColumn({ name: 'id' })
  user: User;
}
