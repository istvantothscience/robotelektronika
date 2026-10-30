import { supabase } from './supabaseClient';
import { UserProfile } from '../types/game';

/** A Pontkövetőben szereplő 8 osztály – a szerver az `app_whoami` alapján úgyis a diák saját osztályába írja a pontot. */
export const SUPPORTED_CLASSES = ['5a', '7a', '7b', '8a', '9a', '10a', '11a', '12a'] as const;

function huAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'Hibás e-mail vagy jelszó';
  if (m.includes('rate limit') || m.includes('too many')) return 'Túl sok próbálkozás – várj pár percet';
  if (m.includes('unable to validate email') || m.includes('invalid format')) return 'Érvénytelen e-mail cím';
  if (m.includes('failed to fetch') || m.includes('network')) return 'Nincs hálózati kapcsolat';
  return message || 'Hitelesítési hiba';
}

export interface WhoAmI {
  class_code: string;
  name: string;
}

/** Ki a bejelentkezett diák? (Pontkövető címtár: osztály + név.) */
async function whoAmI(): Promise<WhoAmI | null> {
  const { data, error } = await supabase.rpc('app_whoami');
  if (error) throw new Error(error.message);
  return (data as WhoAmI[] | null)?.[0] ?? null;
}

async function profileFromSession(): Promise<UserProfile | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  const who = await whoAmI();
  if (!who) return null;
  return {
    id: session.user.id,
    displayName: `${who.name} (${who.class_code})`,
    email: session.user.email ?? undefined,
    role: 'student',
    classId: who.class_code,
    avatarSeed: who.name,
  };
}

export const authService = {
  /** Belépés a közös Pontkövető fiókkal. Siker esetén visszaadja a diák profilját. */
  async signIn(email: string, password: string): Promise<UserProfile> {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(huAuthError(error.message));
    const profile = await profileFromSession();
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('A fiókod nincs osztályhoz kötve – előbb regisztrálj a Pontkövetőben (Első belépés).');
    }
    return profile;
  },

  /** A mentett munkamenet profilja (vagy null, ha nincs/lejárt). */
  async restore(): Promise<UserProfile | null> {
    try {
      return await profileFromSession();
    } catch {
      return null;
    }
  },

  async currentAuthUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async sendReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(huAuthError(error.message));
  },
};
