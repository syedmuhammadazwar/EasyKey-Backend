import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LockerService } from './locker.service';
import { LockerController } from './locker.controller';
import { Locker } from './locker.entity';
import { Key } from './key.entity';
import { Terminal } from '../terminal/terminal.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locker, Key, Terminal, User])],
  controllers: [LockerController],
  providers: [LockerService],
  exports: [LockerService],
})
export class LockerModule {}
