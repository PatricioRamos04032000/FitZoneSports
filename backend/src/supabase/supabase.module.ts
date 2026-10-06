import {Global, Module} from '@nestjs/common';
import {APP_FILTER} from '@nestjs/core';
import {RepositoryErrorFilter} from './repository-error.filter';
import {SupabaseService} from './supabase.service';

@Global()
@Module({
  providers: [
    SupabaseService,
    { provide: APP_FILTER, useClass: RepositoryErrorFilter },
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
