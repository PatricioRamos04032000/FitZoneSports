import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/** Formato básico local@dominio.tld (no verifica que el buzón exista). */
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export type RegisterInput = {
  email: string;
  password: string;
  dni: string;
  nombre: string;
  apellido?: string | null;
  telefono?: string | null;
};

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.createAuthClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      access_token: data.session.access_token,
      user: data.user,
    };
  }

  /**
   * Alta de usuario externo: formato de email en Nest, signUp en Supabase
   * (mail de confirmación) + fila en perfiles. Sin access_token hasta confirmar.
   */
  async register(input: RegisterInput) {
    const email = this.emailValido(input.email);
    const password = this.textoRequerido(input.password, 'password');
    const dni = this.textoRequerido(input.dni, 'dni');
    const nombre = this.textoRequerido(input.nombre, 'nombre');
    const apellido = this.textoOpcional(input.apellido);
    const telefono = this.textoOpcional(input.telefono);

    const { data, error } = await this.supabase.createSignupClient().auth.signUp({
      email,
      password,
    });

    if (error) {
      // Respaldo: algunos proyectos Auth sí mandan texto; el camino habitual es identities vacío.
      if (error.message.toLowerCase().includes('already')) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw new BadRequestException(error.message || 'No se pudo registrar el usuario');
    }

    const user = data.user;
    if (!user?.id) {
      throw new BadRequestException('No se pudo registrar el usuario');
    }
    const userId = user.id;

    // En nuestro Supabase: email duplicado → 200, identities []. Verificado 2026-10-31 (LOG S6-T02).
    if (Array.isArray(user.identities) && user.identities.length === 0) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const { error: perfilError } = await this.supabase
      .getClient()
      .from('perfiles')
      .insert({
        id: userId,
        rol: 'externo',
        dni,
        nombre,
        apellido,
        telefono,
      });

    if (perfilError) {
      await this.supabase.getClient().auth.admin.deleteUser(userId);
      if (perfilError.code === '23505') {
        throw new ConflictException('Ya existe un perfil con ese DNI');
      }
      throw new BadRequestException(
        perfilError.message || 'No se pudo crear el perfil del usuario',
      );
    }

    return {
      user: { id: userId, email },
      message: 'Revisá tu email para confirmar la cuenta',
    };
  }

  private emailValido(valor: unknown): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new BadRequestException('Email inválido');
    }
    const email = valor.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      throw new BadRequestException('Email inválido');
    }
    return email;
  }

  private textoRequerido(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new BadRequestException(`${campo} es obligatorio`);
    }
    return valor.trim();
  }

  private textoOpcional(valor: unknown): string | null {
    if (valor == null) return null;
    if (typeof valor !== 'string') {
      throw new BadRequestException('apellido y telefono deben ser string o null');
    }
    const t = valor.trim();
    return t === '' ? null : t;
  }

}
