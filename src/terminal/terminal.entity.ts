import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TerminalStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity()
export class Terminal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  terminalNumber: string; // Terminal number/ID

  @Column({
    type: 'enum',
    enum: TerminalStatus,
    default: TerminalStatus.ACTIVE,
  })
  status: TerminalStatus;

  @Column({ nullable: true })
  assignedUserId: number; // Reference to the assigned user

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}