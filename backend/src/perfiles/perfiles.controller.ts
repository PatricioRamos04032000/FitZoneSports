import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthUserDto } from '../auth/auth-user.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActualizarPerfilDto, PerfilMeDto } from './perfil.dto';
import { PerfilesService } from './perfiles.service';

@ApiTags('perfiles')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' })
@UseGuards(JwtAuthGuard)
@Controller('perfiles')
export class PerfilesController {
  constructor(private readonly service: PerfilesService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Perfil del usuario autenticado',
    description:
      'Lee public.perfiles con el id del JWT (claim sub). No acepta perfilId del cliente.',
  })
  @ApiOkResponse({ type: PerfilMeDto })
  @ApiNotFoundResponse({ description: 'El usuario no tiene perfil' })
  async me(@CurrentUser() user: AuthUserDto): Promise<PerfilMeDto> {
    const perfil = await this.service.obtenerMio(user.id);
    return { ...perfil, email: user.email };
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Actualiza el perfil propio',
    description:
      'Solo dni, nombre, apellido, telefono, foto_url y sede_home_id. No cambia rol ni preferencias de email.',
  })
  @ApiOkResponse({ type: PerfilMeDto })
  @ApiBadRequestResponse({
    description: 'Body vacío, campos inválidos o sede inexistente',
  })
  @ApiConflictResponse({ description: 'DNI ya usado por otro perfil' })
  @ApiNotFoundResponse({ description: 'El usuario no tiene perfil' })
  async actualizar(
    @CurrentUser() user: AuthUserDto,
    @Body() body: ActualizarPerfilDto,
  ): Promise<PerfilMeDto> {
    const perfil = await this.service.actualizarMio(user.id, body);
    return { ...perfil, email: user.email };
  }
}
