export function validateEmail(email: string): string | null {
  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'صيغة البريد غير صحيحة';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'كلمة المرور مطلوبة';
  if (password.length < 8) return 'كلمة المرور 8 أحرف على الأقل';
  return null;
}
