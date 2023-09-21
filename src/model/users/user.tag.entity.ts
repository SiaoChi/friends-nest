import {
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'user_tag_v1' })
export class UserTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' }) // 指定外鍵名稱
  user_id: string;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' }) // 指定外鍵名稱
  tag_id: number;
}
