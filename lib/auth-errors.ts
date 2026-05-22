export const LOGIN_ERROR_COOKIE = "hris_login_error";

export const errorMessages: Record<string, string> = {
  CredentialsSignin: "Email atau password Odoo tidak valid.",
  AccessDenied: "Akses login ditolak.",
  GoogleAccountEmailRequired: "Akun Google harus memiliki email yang valid.",
  GoogleAccountNotLinked:
    "Email Google tidak terdaftar di sistem. Silakan hubungi administrator.",
  Configuration: "Konfigurasi autentikasi belum lengkap.",
};

export const getLoginErrorMessage = (code?: string | null) => {
  if (!code) return "";

  // return errorMessages[code] ?? "Login gagal, silakan coba lagi.";
  if (errorMessages[code]) {
    return errorMessages[code];
  }

  if (code.toLowerCase() === "error") {
    return "Login gagal, silakan coba lagi.";
  }

  return code;
};
