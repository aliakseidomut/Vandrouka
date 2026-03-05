import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      token,
    };
  }

  async registerWithGoogle(googleData: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  }) {
    // Check if user exists
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleData.id }, { email: googleData.email }],
      },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleData.email,
          googleId: googleData.id,
          name: googleData.name,
          picture: googleData.picture,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleData.id,
          name: googleData.name || user.name,
          picture: googleData.picture || user.picture,
        },
      });
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      token,
    };
  }
}
