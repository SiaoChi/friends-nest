// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  private readonly secretKey = process.env.JWT_KEY;

  EXPIRE_TIME = 60 * 60 * 60;

  generateToken(payload: object): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.EXPIRE_TIME });
  }
}
