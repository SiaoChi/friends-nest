// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly secretKey = process.env.JWT_KEY;

  EXPIRE_TIME = 60 * 60 * 60;

  generateToken(userId: string): string {
    const payload = { userId };
    return jwt.sign(payload, this.secretKey, { expiresIn: this.EXPIRE_TIME });
  }
}
