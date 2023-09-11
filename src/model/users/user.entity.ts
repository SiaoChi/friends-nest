import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'user_v1' })
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
