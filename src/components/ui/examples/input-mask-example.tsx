'use client'

import { useState } from 'react'
import { InputMask } from '../input-mask'

export function InputMaskExamples() {
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [cep, setCep] = useState('')
  const [custom, setCustom] = useState('')
  const [autoPlaceholder, setAutoPlaceholder] = useState('')

  return (
    <div className="space-y-4 p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Exemplos de Input com Máscara</h1>
      
      <div className="space-y-2">
        <label htmlFor="cpf" className="block text-sm font-medium">
          CPF
        </label>
        <InputMask
          id="cpf"
          mask="111.111.111-11"
          maskChar="1"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(value) => setCpf(value)}
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {cpf}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="cnpj" className="block text-sm font-medium">
          CNPJ
        </label>
        <InputMask
          id="cnpj"
          mask="11.111.111/1111-11"
          maskChar="1"
          placeholder="00.000.000/0000-00"
          value={cnpj}
          onChange={(value) => setCnpj(value)}
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {cnpj}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefone
        </label>
        <InputMask
          id="phone"
          mask="(11) 11111-1111"
          maskChar="1"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(value) => setPhone(value)}
          inputMode="numeric"
          type="tel"
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {phone}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium">
          Data (DD/MM/AAAA)
        </label>
        <InputMask
          id="date"
          mask="11/11/1111"
          maskChar="1"
          placeholder="DD/MM/AAAA"
          value={date}
          onChange={(value) => setDate(value)}
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {date}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="cep" className="block text-sm font-medium">
          CEP
        </label>
        <InputMask
          id="cep"
          mask="11111-111"
          maskChar="1"
          placeholder="00000-000"
          value={cep}
          onChange={(value) => setCep(value)}
          inputMode="numeric"
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {cep}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="custom" className="block text-sm font-medium">
          Máscara Personalizada (AAA-999)
        </label>
        <InputMask
          id="custom"
          mask="AAA-111"
          maskChar="A"
          placeholder="ABC-123"
          value={custom}
          onChange={(value) => setCustom(value)}
        />
        <p className="text-xs text-gray-500">Valor sem máscara: {custom}</p>
      </div>

      <div className="space-y-2 pt-4 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Placeholder Automático</h2>
        <label htmlFor="autoPlaceholder" className="block text-sm font-medium">
          Máscara com Placeholder Automático
        </label>
        <InputMask
          id="autoPlaceholder"
          mask="(XX) XXXXX-XXXX"
          maskChar="X"
          value={autoPlaceholder}
          onChange={(value) => setAutoPlaceholder(value)}
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500">
          Observe que o placeholder "_" foi gerado automaticamente a partir da máscara
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="autoPlaceholder2" className="block text-sm font-medium">
          Cartão de Crédito
        </label>
        <InputMask
          id="autoPlaceholder2"
          mask="CCCC CCCC CCCC CCCC"
          maskChar="C"
          value={autoPlaceholder}
          onChange={(value) => setAutoPlaceholder(value)}
          className="bg-gray-50"
          inputMode="numeric"
        />
      </div>
    </div>
  )
} 