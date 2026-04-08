import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: string, pass: string): Promise<any> {
    console.log(`[Auth] Tentativa de validação para o usuário: ${login}`);
    
    if (!login || !pass) {
      console.error('[Auth] Login ou senha não fornecidos');
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      console.warn(`[Auth] Usuário não encontrado: ${login}`);
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      console.log(`[Auth] Senha conferida com sucesso para: ${login}`);
      const { password, ...result } = user;
      return result;
    }
    
    console.warn(`[Auth] Senha incorreta para o usuário: ${login}`);
    return null;
  }

  async login(user: any) {
    const payload = { 
        username: user.login, 
        sub: user.id, 
        name: user.name, 
        profile: user.profile 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }
}
