import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tags_v1' })
export class Tag {
  @PrimaryGeneratedColumn()
  tag_id: number;

  @Column()
  name: string;

  @Column({ default: 1 })
  score: number;
}
