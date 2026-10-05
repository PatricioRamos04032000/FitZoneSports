import { TEST_SUPABASE_URL } from './support/supabase-jwt';

process.env.SUPABASE_URL = TEST_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
