export function GetBgColor(idCompany: string, hover: boolean = false) {
    let backgroundColor = `bg-primary-blue${hover ? ' hover:bg-blue-700' : ''}`
    if (idCompany === '01JTNVAEYETZAJP0F4X7YQYQBR') {
        backgroundColor = `bg-green-nv${hover ? ' hover:bg-[#00452a]' : ''}`
    }
    return backgroundColor
}
