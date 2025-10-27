import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locker } from './locker.entity';
import { Key } from './key.entity';
import { Terminal } from '../terminal/terminal.entity';
import { User } from '../user/user.entity';
import { CreateLockerDto, UpdateLockerDto, PurchaseLockerDto, CreateKeyDto, UpdateKeyDto, AssignLockersToTerminalDto } from './dto/locker.dto';
import { v4 as uuidv4 } from 'uuid';
import { LockerStatus } from './locker.entity';
import { KeyStatus } from './key.entity';

@Injectable()
export class LockerService {
  constructor(
    @InjectRepository(Locker)
    private readonly lockerRepo: Repository<Locker>,
    @InjectRepository(Key)
    private readonly keyRepo: Repository<Key>,
    @InjectRepository(Terminal)
    private readonly terminalRepo: Repository<Terminal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createLockerDto: CreateLockerDto): Promise<Locker> {
    // Check if terminal exists
    const terminal = await this.terminalRepo.findOne({ where: { id: createLockerDto.terminalId } });
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${createLockerDto.terminalId} not found`);
    }

    // Check if locker number already exists
    const existingLocker = await this.lockerRepo.findOne({
      where: { lockerNumber: createLockerDto.lockerNumber }
    });

    if (existingLocker) {
      throw new BadRequestException('Locker with this number already exists');
    }

    const locker = this.lockerRepo.create(createLockerDto);
    return this.lockerRepo.save(locker);
  }

  async findAll(terminalId?: number): Promise<Locker[]> {
    if (terminalId) {
      return this.lockerRepo.find({
        where: { terminalId },
        relations: ['terminal', 'key'],
        order: { lockerNumber: 'ASC' }
      });
    }
    return this.lockerRepo.find({
      relations: ['terminal', 'key'],
      order: { lockerNumber: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Locker> {
    const locker = await this.lockerRepo.findOne({
      where: { id },
      relations: ['terminal', 'key', 'purchaser']
    });

    if (!locker) {
      throw new NotFoundException(`Locker with ID ${id} not found`);
    }

    return locker;
  }

  async findByLockerNumber(lockerNumber: string): Promise<Locker> {
    const locker = await this.lockerRepo.findOne({
      where: { lockerNumber },
      relations: ['terminal', 'key', 'purchaser']
    });

    if (!locker) {
      throw new NotFoundException(`Locker with number ${lockerNumber} not found`);
    }

    return locker;
  }

  async update(id: number, updateLockerDto: UpdateLockerDto): Promise<Locker> {
    const locker = await this.findOne(id);

    // If terminal is being changed, validate new terminal exists
    if (updateLockerDto.terminalId && updateLockerDto.terminalId !== locker.terminalId) {
      const newTerminal = await this.terminalRepo.findOne({ where: { id: updateLockerDto.terminalId } });
      if (!newTerminal) {
        throw new NotFoundException(`Terminal with ID ${updateLockerDto.terminalId} not found`);
      }
    }

    // If locker number is being changed, check for duplicates
    if (updateLockerDto.lockerNumber && updateLockerDto.lockerNumber !== locker.lockerNumber) {
      const existingLocker = await this.lockerRepo.findOne({
        where: { lockerNumber: updateLockerDto.lockerNumber }
      });
      if (existingLocker) {
        throw new BadRequestException('Locker with this number already exists');
      }
    }

    Object.assign(locker, updateLockerDto);
    return this.lockerRepo.save(locker);
  }

  async remove(id: number): Promise<void> {
    const locker = await this.findOne(id);

    // Delete associated key if exists
    if (locker.key) {
      await this.keyRepo.remove(locker.key);
    }

    await this.lockerRepo.remove(locker);
  }

  // Assign multiple lockers to a terminal at once
  async assignLockersToTerminal(dto: AssignLockersToTerminalDto): Promise<Locker[]> {
    // Check if terminal exists
    const terminal = await this.terminalRepo.findOne({ where: { id: dto.terminalId } });
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${dto.terminalId} not found`);
    }

    const lockers: Locker[] = [];
    
    for (const lockerNumber of dto.lockerNumbers) {
      // Check if locker number already exists
      const existingLocker = await this.lockerRepo.findOne({
        where: { lockerNumber }
      });

      if (existingLocker) {
        throw new BadRequestException(`Locker with number ${lockerNumber} already exists`);
      }

      const locker = this.lockerRepo.create({
        lockerNumber,
        terminalId: dto.terminalId,
        location: dto.location,
        size: dto.size,
        status: LockerStatus.ACTIVE
      });

      lockers.push(locker);
    }

    return this.lockerRepo.save(lockers);
  }

  // Purchase a locker (creates key automatically)
  async purchaseLocker(purchaseDto: PurchaseLockerDto): Promise<{ locker: Locker; key: Key }> {
    const { userId, lockerId } = purchaseDto;

    // Check if user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if locker exists and is available
    const locker = await this.findOne(lockerId);

    if (locker.status === LockerStatus.OCCUPIED) {
      throw new BadRequestException('Locker is already occupied');
    }

    if (locker.key) {
      throw new BadRequestException('Locker already has a key');
    }

    // Update locker status and purchase info
    locker.status = LockerStatus.OCCUPIED;
    locker.purchasedBy = userId;
    locker.purchasedAt = new Date();
    await this.lockerRepo.save(locker);

    // Generate unique key code
    const keyCode = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create key for the locker
    const key = this.keyRepo.create({
      keyCode,
      lockerId: locker.id,
      status: KeyStatus.ACTIVE
    });

    const savedKey = await this.keyRepo.save(key);

    // Reload locker with key
    const updatedLocker = await this.findOne(locker.id);

    return { locker: updatedLocker, key: savedKey };
  }

  // Key management
  async getKeyByLocker(lockerId: number): Promise<Key> {
    const locker = await this.findOne(lockerId);
    return locker.key;
  }

  async getKeyByKeyCode(keyCode: string): Promise<Key> {
    const key = await this.keyRepo.findOne({
      where: { keyCode },
      relations: ['locker']
    });

    if (!key) {
      throw new NotFoundException(`Key with code ${keyCode} not found`);
    }

    return key;
  }

  async updateKey(id: number, updateKeyDto: UpdateKeyDto): Promise<Key> {
    const key = await this.keyRepo.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException(`Key with ID ${id} not found`);
    }

    Object.assign(key, updateKeyDto);
    return this.keyRepo.save(key);
  }

  async deactivateKey(keyId: number): Promise<Key> {
    const key = await this.keyRepo.findOne({ where: { id: keyId } });
    if (!key) {
      throw new NotFoundException(`Key with ID ${keyId} not found`);
    }

    key.status = KeyStatus.DEACTIVATED;
    return this.keyRepo.save(key);
  }

  async getAvailableLockers(terminalId?: number): Promise<Locker[]> {
    const where: any = { 
      status: LockerStatus.ACTIVE,
      key: null // Lockers without keys
    };

    if (terminalId) {
      where.terminalId = terminalId;
    }

    return this.lockerRepo.find({
      where,
      relations: ['terminal'],
      order: { lockerNumber: 'ASC' }
    });
  }

  async getPurchasedLockers(userId: number): Promise<Locker[]> {
    return this.lockerRepo.find({
      where: { purchasedBy: userId },
      relations: ['terminal', 'key'],
      order: { purchasedAt: 'DESC' }
    });
  }
}
