import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  picture: string;

  @Column({ length: 50 })
  birth: string;

  @Column({ length: 55 })
  location: string;

  @Column()
  sick_year: number;

  @Column({ length: 55 })
  hospital: string;

  @Column({ length: 45 })
  level: string;

  @Column({ length: 45 })
  carer: string;

  @Column({ length: 500 })
  curr_problem: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
