export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

export function setCookie({ name, value, expires, path = '/' }: SetCookieParams) {
  const date = new Date();
  date.setTime(date.getTime() + (expires * 1000));
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=${path}`;
}

export function deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

type SetCookieParams = {
  name: string;
  value: string;
  expires: number;
  path?: string;
}

