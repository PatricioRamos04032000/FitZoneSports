import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto, MeResponseDto } from './auth-user.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PerfilesRolRepository } from './perfiles-rol.repository';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class MeController {
  constructor(private readonly perfiles: PerfilesRolRepository) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Devuelve el usuario del token y su rol de FitZone' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
  async me(@CurrentUser() user: AuthUserDto): Promise<MeResponseDto> {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      rol: await this.perfiles.findRol(user.id),
    };
  }
}
