import { groups, passwordHash, sign } from './auth.mjs';
import { timingSafeEqual } from 'node:crypto';

// 分享凭证仅授权一个群；更换该群密码后，已生成二维码一并失效。
export function invitation(group) {
  if (!groups.includes(group)) throw new Error('GROUP_REQUIRED');
  return `v1.${group}.${sign(`share:${group}:${passwordHash(group)}`)}`;
}

export function checkInvitation(group, value) {
  if (!groups.includes(group) || typeof value !== 'string' || !/^v1\.(baolong|luanshan)\.[a-f0-9]{64}$/.test(value)) return false;
  const expected = invitation(group);
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
