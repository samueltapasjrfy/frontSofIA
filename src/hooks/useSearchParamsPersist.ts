import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useCallback, useMemo } from 'react';
import { isEmpty } from '@/utils/validators';

interface ConfigSearhParams<TParams> {
  prefix?: string;
  initialParams?: TParams;
}

export const useSearchParamsPersist = <TParams extends object>(
  config?: ConfigSearhParams<TParams>,
) => {
  const router = useRouter();
  const pathname = usePathname(); // Obtém a rota atual
  const searchParams = useSearchParams();
  const prefix = config?.prefix ? `${config.prefix}_` : '';

  const addPrefix = useCallback((params: Record<any, any>, prefix: string) => {
    if (!params) return {};
    return Object.keys(params).reduce((acc: Record<any, any>, key) => {
      acc[`${prefix}${key}`] = params[key];
      return acc;
    }, {});
  }, []);

  const setSearchParamsPersist = useCallback(
    (params: Record<any, any>) => {
      const prefixedParams = addPrefix(params, prefix);
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

      Object.keys(prefixedParams).forEach((key) => {
        if (isEmpty(prefixedParams[key])) {
          currentParams.delete(key);
        } else {
          currentParams.set(key, prefixedParams[key]);
        }
      });

      router.push(`${pathname}?${currentParams.toString()}`);
    },
    [addPrefix, prefix, router, searchParams, pathname],
  );

  const getFilteredParams = useCallback(() => {
    const params: { [key: string]: any } = {};

    searchParams.forEach((value, key) => {
      const [keyPrefix, keyWithoutPrefix] = key.split('_');

      if (config?.prefix && keyPrefix !== config.prefix) return;

      if (!config?.prefix) {
        params[keyPrefix] = value;
        return;
      }

      if (value.includes(',')) {
        params[keyWithoutPrefix] = value.split(',').map((v) => v.trim());
      } else {
        params[keyWithoutPrefix] = value;
      }
    });

    return params as TParams;
  }, [config?.prefix, searchParams]);

  const resetParams = useCallback(() => {
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

    currentParams.forEach((_, key) => {
      if (key.includes(prefix)) {
        currentParams.delete(key);
      }
    });

    const newParams = config?.initialParams ? addPrefix(config.initialParams, prefix) : {};
    const updatedParams = new URLSearchParams(newParams).toString();

    router.push(`${pathname}${updatedParams ? `?${updatedParams}` : ''}`);
  }, [addPrefix, config?.initialParams, prefix, router, searchParams, pathname]);

  useEffect(() => {
    if (config?.initialParams) {
      setSearchParamsPersist(config.initialParams);
    }
  }, [config?.initialParams]);

  const paramsPersisted = useMemo(() => getFilteredParams(), [getFilteredParams]);

  return { setSearchParamsPersist, paramsPersisted, resetParams };
};
