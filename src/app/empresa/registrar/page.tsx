'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import RegisterCompanyForm from './register-form'
import RegistrationComplete from './complete'
import { RegisterCompanyFormData } from './type'
import { CompanyApi } from '@/api/companyApi'
import { getLocalStorage, LocalStorageKeys, setLocalStorage } from '@/utils/localStorage'
import { LoginResponse } from '@/api/authApi'

type Step = 'form' | 'complete'

export default function RegisterCompany() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [formData, setFormData] = useState<RegisterCompanyFormData>({
    companyName: '',
    document: '',
    description: ''
  })

  const handleChange = (value: string, name: keyof RegisterCompanyFormData) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await CompanyApi.saveCompany({
        name: formData.companyName,
        document: formData.document,
        info: { description: formData.description }
      })
      if (response.error) {
        toast.error(response.message || 'Erro ao registrar empresa. Tente novamente.')
        return
      }
      const userData = getLocalStorage<LoginResponse>(LocalStorageKeys.USER)
      userData.companies.push(response.data)
      setLocalStorage(LocalStorageKeys.USER, userData)
      setStep('complete')
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      toast.error('Erro ao registrar empresa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {step === 'form' && (
        <RegisterCompanyForm 
          handleSubmit={handleSubmit} 
          formData={formData} 
          handleChange={handleChange} 
          loading={loading} 
        />
      )}
      {step === 'complete' && (
        <RegistrationComplete />
      )}
    </>
  )
} 