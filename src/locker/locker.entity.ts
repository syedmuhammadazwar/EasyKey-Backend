import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Terminal } from '../terminal/terminal.entity';
import { Key } from './key.entity';
import { User } from '../user/user.entity';

export enum LockerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OCCUPIED = 'occupied',
}

@Entity()
export class Locker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lockerNumber: string; // Unique locker identifier (e.g., LKR-001)

  @Column()
  terminalId: number; // Links to terminal

  @Column({ nullable: true })
  location: string; // Physical location/description

  @Column({
    type: 'enum',
    enum: LockerStatus,
    default: LockerStatus.ACTIVE,
  })
  status: LockerStatus;

  @Column({ nullable: true })
  size: string; // Locker size (small, medium, large, etc.)

  @Column({ nullable: true })
  notes: string; // Additional notes

  @Column({ nullable: true })
  purchasedBy: number; // User who purchased this locker

  @Column({ nullable: true })
  purchasedAt: Date; // When the locker was purchased

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Terminal)
  @JoinColumn({ name: 'terminalId' })
  terminal: Terminal;

  @OneToOne(() => Key, key => key.locker)
  key: Key;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'purchasedBy' })
  purchaser: User;
}
