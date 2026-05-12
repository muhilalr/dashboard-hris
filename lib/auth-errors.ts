export const LOGIN_ERROR_COOKIE = "hris_login_error";

export const errorMessages: Record<string, string> = {
  CredentialsSignin: "Email/username atau password tidak valid.",
  AccessDenied: "Akses login ditolak.",
  GoogleAccountEmailRequired: "Akun Google harus memiliki email yang valid.",
  GoogleAccountNotLinked:
    "Email Google belum terhubung dengan user Odoo yang aktif.",
  Configuration: "Konfigurasi autentikasi belum lengkap.",
};

export const getLoginErrorMessage = (code?: string | null) => {
  if (!code) return "";

  return errorMessages[code] ?? "Login gagal, silakan coba lagi.";
};
