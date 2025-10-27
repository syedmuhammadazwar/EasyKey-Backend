import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Locker } from './locker.entity';

export enum KeyStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
  LOST = 'lost',
}

@Entity()
export class Key {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  keyCode: string; // Unique key code (e.g., generated UUID or alphanumeric code)

  @Column()
  lockerId: number; // Links to locker

  @Column({
    type: 'enum',
    enum: KeyStatus,
    default: KeyStatus.ACTIVE,
  })
  status: KeyStatus;

  @Column({ nullable: true })
  secretPin: string; // Optional PIN for additional security

  @Column({ nullable: true })
  expiryDate: Date; // Optional expiry date

  @Column({ nullable: true })
  lastUsed: Date; // When the key was last used

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Locker, locker => locker.key)
  @JoinColumn({ name: 'lockerId' })
  locker: Locker;
}
