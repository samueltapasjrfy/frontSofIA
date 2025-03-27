import { LoginResponse } from "@/api/authApi"
import { getLocalStorage, LocalStorageKeys } from "./localStorage"

type VerifyCompanyProps = {
    registerOrgPage?: boolean
}
export const verifyCompany = ({ registerOrgPage }: VerifyCompanyProps): boolean => {
    const user = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
    const company = String(user.companies?.[0]?.name || "").trim()
    if (company !== '' && registerOrgPage) {
        window.location.href = '/dashboard'
        return false
    }
    else if (company === '' && !registerOrgPage) {
        window.location.href = '/empresa/registrar'
        return false
    }
    return true
}
