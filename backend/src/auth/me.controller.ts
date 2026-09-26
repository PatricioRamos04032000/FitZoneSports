import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class MeController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Devuelve el usuario del token Supabase' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
  me(@CurrentUser() user: AuthUserDto): AuthUserDto {
    return user;
  }
}
