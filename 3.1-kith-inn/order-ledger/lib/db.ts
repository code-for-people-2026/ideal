import {neon} from '@neondatabase/serverless';
export function database(){if(!process.env.DATABASE_URL)throw Error('数据库未配置');return neon(process.env.DATABASE_URL)}
