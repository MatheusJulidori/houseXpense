import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogMethod } from '../../decorators/log.decorator';
import { JwtAuthGuard } from '../../utils/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {
    this.logger.log('AuthController initialized');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  @LogMethod('info')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ access_token: string }> {
    this.logger.log(
      `Register: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    const result = await this.authService.register(registerDto);
    this.logger.log(
      `Register success: ${registerDto.firstName} ${registerDto.lastName}`,
    );
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @LogMethod('info')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    this.logger.log(`Login: ${loginDto.username}`);
    const result = await this.authService.login(loginDto);
    this.logger.log(`Login success: ${loginDto.username}`);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user returned' })
  @LogMethod('info')
  async me(@Request() req: { user: { userId: string } }) {
    const user = await this.authService.validateUser(req.user.userId);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
