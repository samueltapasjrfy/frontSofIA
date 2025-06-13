export const handleApiParams = (params: Record<string, any>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length === 0) {
            return delete params[key as keyof typeof params];
        } else if (!Array.isArray(value) && value === '') {
            return delete params[key as keyof typeof params];
        }
        Array.isArray(value) ? value.forEach((item) => query.append(`${key}[]`, item.toString())) : query.append(key, value.toString());
    });
    return query
}