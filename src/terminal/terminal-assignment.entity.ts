import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Terminal } from './terminal.entity';
import { User } from '../user/user.entity';

@Entity()
export class TerminalAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  terminalId: number;

  @Column()
  userId: number;

  @Column()
  shopName: string; // Name of shop

  @Column()
  streetAddress: string; // Street address

  @Column()
  postalCode: string; // Postal Code

  @Column()
  stateRegion: string; // State/Region

  @Column()
  email: string; // Email

  @Column()
  phoneNumber: string; // Phone number

  @Column({ nullable: true })
  gpsCoordinates: string; // GPS Coordinates

  @Column()
  macAddress: string; // Terminal MAC address

  @Column({ default: true })
  isActive: boolean; // Whether this assignment is currently active

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Terminal)
  @JoinColumn({ name: 'terminalId' })
  terminal: Terminal;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
