import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'user_tag_v1' })
export class UserTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.user_id)
  @JoinColumn({ name: 'user_id' }) // 指定外鍵名稱
  user_id: string;

  @ManyToOne(() => Tag, (tag) => tag.tag_id)
  @JoinColumn({ name: 'tag_id' }) // 指定外鍵名稱
  tag_id: number;
}
