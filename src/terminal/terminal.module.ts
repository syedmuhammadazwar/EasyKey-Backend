import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminalService } from './terminal.service';
import { TerminalController } from './terminal.controller';
import { Terminal } from './terminal.entity';
import { TerminalAssignment } from './terminal-assignment.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Terminal, TerminalAssignment, User])],
  controllers: [TerminalController],
  providers: [TerminalService],
  exports: [TerminalService],
})
export class TerminalModule {}
