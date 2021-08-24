import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { PostgresErrorCode } from '../database/postgresErrorCode.enum';
import {
  ResetPasswordDto,
  CreateUserDto,
  UserEntity,
  SaveApiKeyDto,
} from '@pdf-me/shared';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @Inject('LIMITS_SERVICE') private limitsService: ClientProxy,
  ) {}

  async create(userData: CreateUserDto) {
    try {
      const newUser = await this.usersRepository.create(userData);
      await this.usersRepository.save(newUser);
      await this.limitsService
        .send({ cmd: 'limits-create' }, newUser.id)
        .toPromise();
      return newUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        return {
          message: 'User with that email already exists',
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Something went wrong',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      return user;
    }
    throw new RpcException({
      message: 'User with this email does not exist',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ id });
    if (user) {
      return user;
    }
    throw new RpcException({
      message: 'User with this id does not exist',
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  async setResettingPassword(email: string) {
    await this.usersRepository.update({ email }, { isResettingPassword: true });
    return true;
  }

  async updatePassword({ email, password }: ResetPasswordDto) {
    await this.usersRepository.update(
      { email },
      { isResettingPassword: false, password },
    );
    return true;
  }

  async confirmEmail(email: string) {
    await this.usersRepository.update({ email }, { isEmailConfirmed: true });
    return true;
  }

  async saveApiKey(keyData: SaveApiKeyDto) {
    await this.usersRepository.update(
      { id: keyData.userId },
      { key: keyData.key },
    );
    return true;
  }
}
