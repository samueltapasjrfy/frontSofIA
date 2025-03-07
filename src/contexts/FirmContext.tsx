"use client";

import { createContext, ReactNode, useState, useContext } from "react";

interface FirmData {
  name: string;
  logo?: string;
}

interface FirmContextType {
  firmData: FirmData;
  updateFirmData: (data: FirmData) => void;
  isLoading: boolean;
}

const defaultFirmData: FirmData = {
  name: "Barcelos & Janssen Advogados",
  logo: undefined
};

const FirmContext = createContext<FirmContextType>({
  firmData: defaultFirmData,
  updateFirmData: () => {},
  isLoading: false
});

export function useFirm() {
  return useContext(FirmContext);
}

interface FirmProviderProps {
  children: ReactNode;
}

export function FirmProvider({ children }: FirmProviderProps) {
  const [firmData, setFirmData] = useState<FirmData>(defaultFirmData);
  const [isLoading] = useState(false);

  // Esta função será usada para atualizar os dados do escritório
  // quando integrarmos com a API
  const updateFirmData = async (data: FirmData) => {
    setFirmData(data);
  };

  // Aqui podemos adicionar um useEffect para buscar os dados da API
  // quando o componente for montado
  // useEffect(() => {
  //   const fetchFirmData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch('/api/firm');
  //       const data = await response.json();
  //       setFirmData(data);
  //     } catch (error) {
  //       console.error('Erro ao buscar dados do escritório:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //
  //   fetchFirmData();
  // }, []);

  return (
    <FirmContext.Provider value={{ firmData, updateFirmData, isLoading }}>
      {children}
    </FirmContext.Provider>
  );
} 