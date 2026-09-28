import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {createClient, SupabaseClient} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly client: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        
        if(!supabaseUrl || !supabaseKey){
            throw new Error('Faltan las credenciales de supabase en las variables de entorno');
        }

        this.client = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
            },
        });
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}