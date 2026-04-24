import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UserRole {
  ESTUDIANTE = 'estudiante',
  DOCENTE = 'docente',
  INSTITUCION = 'institucion',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ESTUDIANTE })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;
}
