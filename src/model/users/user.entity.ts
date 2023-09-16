import {
  Column,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'user_v2' })
@Unique(['email'])
export class User {
  // @PrimaryColumn({ length: 255 })
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  picture: string;

  @Column({ length: 50, nullable: true })
  birth: string;

  @Column({ length: 55, nullable: true })
  location: string;

  @Column({ nullable: true })
  sick_year: number;

  @Column({ length: 55, nullable: true })
  hospital: string;

  @Column({ length: 45, nullable: true })
  level: string;

  @Column({ length: 45, nullable: true })
  carer: string;

  @Column({ length: 500, nullable: true })
  curr_problem: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
