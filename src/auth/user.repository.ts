import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const user = new User();
    user.username = username;
    user.salt = salt;
    user.password = await bcrypt.hash(password, salt);
    try {
      await user.save();
    } catch (e) {
      if (e.code === '23505') {
        throw new ConflictException(`Username ${username} already exists`);
      } else {
        throw new InternalServerErrorException(e);
      }
    }
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      return username;
    }
    return null;
  }
}
