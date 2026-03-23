import { LoginResponse } from "@/api/authApi";
import { ProcessApi } from "@/api/processApi";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import { normalizeString } from "./str";

export const  exportProcessNormal = async (response: ProcessApi.FindAll.Response): Promise<XLSX.WorkBook> => {
    // Preparar dados para exportação
    const data = response.processes.map(pub => {
        const hasPartsFound = pub.partFound?.name;
        let habilitado = '-';
        if (hasPartsFound) {
            habilitado = "Sim";
        } else if (pub.monitoringParts && !hasPartsFound) {
            habilitado = "Não";
        }
        return {
            'Nº Processo': pub.cnj || '-',
            'Instância': pub.instance || '-',
            'Status': pub.imported ? 'Importado' : pub.status?.value || '-',
            'Data Inserção': pub.createdAt
                ? dayjs(pub.createdAt).format('DD/MM/YYYY HH:mm')
                : '-',
            'Citado': pub.cited ? 'Sim' : 'Não',
            'Data da Citação': pub.citedAt
                ? dayjs(pub.citedAt).format('DD/MM/YYYY')
                : '-',
            'Habilitado': habilitado,
            'Núcleo': pub.metadata?.nucleo || '-',
            'Cliente': pub.metadata?.cliente || '-',
            'Controle Cliente': pub.metadata?.controleCliente || '-',
            'Autor ou Réu': pub.metadata?.clienteAutorOuReu || '-',
            'Data Terceirização': pub.metadata?.dataTerceirizacao || '-',
            'Adv Líder / Responsável': pub.metadata?.advLiderResponsavel || '-',
            'Data Distribuição': pub.dateDistribution ? dayjs(pub.dateDistribution).format('DD/MM/YYYY') : '-',
            'Segredo de Justiça': pub.secret ? 'Sim' : 'Não',
            'Tribunal': pub.jurisdiction || '-',
            'Juiz': pub.judge || '-',
            'Valor': pub.value ? Number(pub.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-',
            'Comarca': pub.judicialDistrict || '-',
            'Liminar': pub.preliminaryInjunction ? 'Sim' : 'Não',
            'Foro': pub.foro || '-',
            'Vara': pub.vara || '-',
            'UF': pub.uf || '-',
            'Classes': pub.classes ? pub.classes.join(', ') : '-',
            'Assunto Extra': pub.extraSubject || '-',
            'Área': pub.area || '-',
            'Arquivado': pub.archived ? 'Sim' : 'Não',
            'Extinto': pub.extinct ? 'Sim' : 'Não',
            'Justiça Gratuita': pub.legalAid ? 'Sim' : 'Não',
            'Fonte do Sistema': pub.system || '-',
            'Tribunal Original': pub.originalCourt || '-',
            'Natureza': pub.nature || '-',
            // 'Audiências': pub.audiences ? pub.audiences.map(aud => `${dayjs(aud.date).format('DD/MM/YYYY')}: ${aud.text} (${aud.type}, ${aud.status})`).join('; ') : '-'
        };
    });

    // Preparar dados para a aba de audiências
    const audiencesData: any[] = [];
    response.processes.forEach(proc => {
        if (proc.audiences && proc.audiences.length > 0) {
            proc.audiences.forEach(aud => {
                audiencesData.push({
                    'Nº Processo': proc.cnj || '-',
                    'Data': aud.date ? dayjs(aud.date).format('DD/MM/YYYY HH:mm') : '-',
                    'Descrição': aud.description ? String(aud.description).slice(0, 32760) : '-',
                    'Tipo': aud.type || '-',
                    'Status': aud.status || '-'
                });
            });
        }
    });

    // Preparar dados para a aba de partes contrárias
    const partiesData: any[] = [];
    response.processes.forEach(proc => {
        if (proc.parties && proc.parties.length > 0) {
            proc.parties.forEach(party => {
                partiesData.push({
                    'Nº Processo': proc.cnj || '-',
                    'Nome': party.name || '-',
                    'Documento': party.document || '-',
                    'Tipo': party.type || '-'
                });
            });
        }
    });

    // Criar workbook e worksheets
    const wb = XLSX.utils.book_new();

    // Planilha principal de processos
    const mainWs = XLSX.utils.json_to_sheet(data);
    const mainColWidths = [
        { wch: 25 }, // Nº Processo
        { wch: 10 }, // Instância
        { wch: 15 }, // Status
        { wch: 15 }, // Data Inserção
        { wch: 15 }, // Citado
        { wch: 15 }, // Data da Citação
        { wch: 15 }, // Segredo de Justiça
        { wch: 15 }, // Tribunal
        { wch: 15 }, // Juiz
        { wch: 15 }, // Valor
        { wch: 15 }, // Comarca
        { wch: 15 }, // Liminar
        { wch: 15 }, // Foro
        { wch: 15 }, // Vara
        { wch: 15 }, // UF
        { wch: 15 }, // Classes
        { wch: 15 }, // Assunto Extra
        { wch: 15 }, // Área
        { wch: 15 }, // Arquivado
        { wch: 15 }, // Extinto
        { wch: 15 }, // Justiça Gratuita
        { wch: 15 }, // Fonte do Sistema
        { wch: 15 }, // Tribunal Original
        { wch: 15 }, // Natureza
    ];
    mainWs['!cols'] = mainColWidths;
    XLSX.utils.book_append_sheet(wb, mainWs, 'Processos');

    // Planilha de audiências
    if (audiencesData.length > 0) {
        const audiencesWs = XLSX.utils.json_to_sheet(audiencesData);
        const audiencesColWidths = [
            { wch: 25 }, // Nº Processo
            { wch: 20 }, // Data
            { wch: 40 }, // Descrição
            { wch: 15 }, // Tipo
            { wch: 15 }, // Status
        ];
        audiencesWs['!cols'] = audiencesColWidths;
        XLSX.utils.book_append_sheet(wb, audiencesWs, 'Audiências');
    }

    // Planilha de partes contrárias
    if (partiesData.length > 0) {
        const partiesWs = XLSX.utils.json_to_sheet(partiesData);
        const partiesColWidths = [
            { wch: 25 }, // Nº Processo
            { wch: 40 }, // Nome
            { wch: 20 }, // Documento
            { wch: 15 }, // Tipo
        ];
        partiesWs['!cols'] = partiesColWidths;
        XLSX.utils.book_append_sheet(wb, partiesWs, 'Partes');
    }

    return wb;
}

export const  exportProcessFC = async (response: ProcessApi.FindAll.Response, user: LoginResponse): Promise<XLSX.WorkBook> => {
    // Preparar dados para exportação
    const data = response.processes.map(process => {
        const parties = Array.isArray(process.parties) ? process.parties : [];
        const autorPart = parties.find(party => ['autor', 'parte ativa'].includes(normalizeString(party.type || ''))) ?? null;
        const reuPart = parties.find(party => ['reu', 'parte passiva'].includes(normalizeString(party.type || ''))) ?? null;

        console.log({
            area: process.area, 
            areaInfo: process.metadata?.areasFC, 
            nature: process.nature,
            natureInfo: process.metadata?.naturesFC, 
            client: process.metadata?.cliente,
            advLider: process.metadata?.advLiderResponsavel,
            advLiderInfo: process.metadata?.advogadosFC, 
            nucleo: process.metadata?.nucleo,
            nucleoInfo: process.metadata?.nucleosFC, 
            comarca: process.judicialDistrict,
            comarcaInfo: process.metadata?.judicialDistrictsFC, 
        })
        return {
            'Dt_cadastro_pasta': new Date().toLocaleDateString(),
            'User_cadastro_pasta': "Cadastro automatizado Jurify",
            'NumProcessoCNJ': process.cnj || '',
            'PROCESSO': process.cnj || '',
            'Controle cliente': process.metadata?.controleCliente || '',
            'PROCESSO_NOVO': process.cnj || '',
            'Status': !process.archived && !process.extinct ? 1 : 0,
            'VARA': process.vara || '',
            'Cod_Competencia': process.metadata?.areasFC?.id ?? '', //tbjurisdicao
            'Competência': process.area, //tbjurisdicao
            'Cod_Segmento': '',
            'CodTipoAcao': process.metadata?.naturesFC?.id ?? '', //tbtipoprocesso
            'Tipo Ação': process.nature, //tbtipoprocesso
            'Cód_Cliente': process.metadata?.controleCliente ?? '', //tbcliente -> Informado no import
            'Nome_cliente': process.metadata?.cliente ?? '', //tbcliente -> Informado no import
            'Cod_Adv/Líder_responsável': process.metadata?.advogadosFC?.id ?? '', //tbadvogados - coluna "tipo" tudo que tipo = lider so posso ter o nucleo "massificado" -> Informado no import
            'Adv/Líder_responsável': process.metadata?.advLiderResponsavel ?? '', //tbadvogados - coluna "tipo" tudo que tipo = lider so posso ter o nucleo "massificado" -> Informado no import
            'Cod_Nucleo_Pasta': process.metadata?.nucleosFC?.id ?? '', //tbtiponucleo - coluna tipo m = massificado / p = personalizado
            'COMARCA': process.judicialDistrict, //tbcomarcas,
            'Cód_Comarca': process.metadata?.judicialDistrictsFC?.id ?? '', //tbcomarcas,
            'DtTerceirização': !isNaN(new Date(process.metadata?.dataTerceirizacao).getTime()) ? process.metadata?.dataTerceirizacao : '',
            'Cod_Autor': autorPart ? autorPart.parteFC?.id : '', //tbpartes ?
            'Autor': autorPart ? autorPart.name : '', //tbpartes 
            'tipo_parte': '1', //1 = Autor
            'CPF-CNPJ_PARTE_CONTRARIA': reuPart ? reuPart.document : '',
            'Nome_ Reu': reuPart ? reuPart.name : '', //filtrar por data.subjects.part.subjectType "Parte Passiva"
            'Cod_Reu': reuPart ? reuPart.parteFC?.id : '',  //tbpartes ?
            'tipo_parte ': '7', //7 = Réu
            'cliente? Se o cliente é o Autor ou Réu': process.metadata?.clienteAutorOuReu, //Adaptar para tbpartesprocesso ?
            'Data_andamento': process.lastMovement,
            'Cobrável':'',
            'Disponível_sitecliente': '',
            'Associado': '',
            'status_and': '',
            'Cod_ResumoAnd': '',
            'Andamento': process.lastMovementId,
            'Texto Andamento': process.lastMovementDescription,
            'User_Cadastro_andamento': '',
            'Data_cad_and': '',
            'Hora_cad_and': '',
            'Status_Robo': '',
            'Data_Prazo': '',
            'Cod_Tipo_prazo': '',
            'Cod_Grupo_tipo_prazo': '',
            'Descricao_prazo': '',
            'Peremptorio': '',
            'Cod_advogado_prazo': '',
            'User_cad_prazo': '',
            'Data_cad_prazo': '',
            'Hora_cad_prazo': '',
            'Valor_causa': process.value,
            'Data_distribuição': isNaN(new Date(process.distribuited).getTime()) ? dayjs(process.distribuited).format('DD/MM/YYYY') : '-',
            'observação': '',
            'Cod_filial': process.metadata?.judicialDistrictsFC?.idFilial ?? '', //tbcomarcas
            'COD_CORRESP': process.metadata?.judicialDistrictsFC?.idCorrespondente ?? '', //tbcomarcas
            'CORRESPONDENTE': process.metadata?.judicialDistrictsFC?.nameCorrespondente ?? '', //tbcomarcas
            'Num_contrato': '',
            'Cod_Rating': '',
            'RATING': '',
        };
    });

    // Preparar dados para a aba de audiências
    const movements: any[] = [];
    const partiesData: any[] = [];

    response.processes.forEach(proc => {
        if (proc.audiences && proc.audiences.length > 0) {
            proc.audiences.forEach(aud => {
                movements.push({
                    'CNJ': proc.cnj || '-',
                    'ID Andamento MAX': 1,
                    'Texto do Andamento': aud.description ? String(aud.description).slice(0, 32760) : '-',
                });
            });
        }
        if (proc.citations && proc.citations.length > 0) {
            proc.citations.forEach(citation => {
                movements.push({
                    'CNJ': proc.cnj || '-',
                    'ID Andamento MAX': 2,
                    'Texto do Andamento': citation.text ? String(citation.text).slice(0, 32760) : '-',
                });
            });
        }
        if (proc.parties && proc.parties.length > 0) {
            proc.parties.forEach(party => {
                partiesData.push({
                    'CNJ': proc.cnj || '-',
                    'Nome da Parte': party.name || '-',
                    'Polo': party.type,
                    'Indicador de Cliente': party.name.toLowerCase() === proc.metadata?.cliente?.toLowerCase() ? 'Sim' : 'Não',
                    'Documentos': party.document || '-',
                });
            });
        }
    });

    // Criar workbook e worksheets
    const wb = XLSX.utils.book_new();

    // Planilha principal de processos
    const mainWs = XLSX.utils.json_to_sheet(data);
    const mainColWidths = [
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 25 }, 
        { wch: 15 }, 
        { wch: 25 }, 
        { wch: 10 }, 
    ];
    mainWs['!cols'] = mainColWidths;
    XLSX.utils.book_append_sheet(wb, mainWs, 'Processos');

    // Planilha de audiências
    let movementsWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    if (movements.length > 0) {
        movementsWs = XLSX.utils.json_to_sheet(movements);
        const audiencesColWidths = [
            { wch: 25 }, // CNJ
            { wch: 20 }, // ID Andamento MAX
            { wch: 40 }, // Texto do Andamento
        ];
        movementsWs['!cols'] = audiencesColWidths;
    }
    XLSX.utils.book_append_sheet(wb, movementsWs, 'Andamentos');

    // Planilha de partes contrárias
    let partiesWs: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    if (partiesData.length > 0) {
        partiesWs = XLSX.utils.json_to_sheet(partiesData);
        const partiesColWidths = [
            { wch: 25 }, // CNJ
            { wch: 40 }, // Nome da Parte
            { wch: 20 }, // Pol
            { wch: 20 }, // Indicador de Cliente
            { wch: 20 }, // Documentos
        ];
        partiesWs['!cols'] = partiesColWidths;
    }
    XLSX.utils.book_append_sheet(wb, partiesWs, 'Partes');

    return wb;
}