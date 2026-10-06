import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {createClient, SupabaseClient} from '@supabase/supabase-js';

const SIN_SESION = {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
};

@Injectable()
export class SupabaseService {
    private readonly url: string;
    private readonly key: string;
    private readonly client: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        
        if(!supabaseUrl || !supabaseKey){
            throw new Error('Faltan las credenciales de supabase en las variables de entorno');
        }

        this.url = supabaseUrl;
        this.key = supabaseKey;
        this.client = createClient(supabaseUrl, supabaseKey, { auth: SIN_SESION });
    }

    /** Cliente compartido del backend: nunca usarlo para iniciar sesiones de usuarios. */
    getClient(): SupabaseClient {
        return this.client;
    }

    /**
     * Cliente nuevo para una operación de login. Si el login se hiciera con el
     * cliente compartido, este quedaría con la sesión del usuario y RLS
     * bloquearía todas las consultas siguientes del backend.
     */
    createAuthClient(): SupabaseClient {
        return createClient(this.url, this.key, { auth: SIN_SESION });
    }
}
