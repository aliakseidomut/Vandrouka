import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-google')
  async registerGoogle(
    @Body()
    body: {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    },
  ) {
    return this.authService.registerWithGoogle(body);
  }
}
