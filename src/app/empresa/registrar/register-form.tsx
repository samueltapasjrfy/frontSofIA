'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LottieAnimation } from '@/components/ui/lottie-animation'
import { TextareaWithLimit } from '@/components/ui/textarea-with-limit'
import { RegisterCompanyFormData } from './type'
import { InputMask } from '@/components/ui/input-mask'

const MAX_DESCRIPTION_LENGTH = 500;

type RegisterCompanyFormProps = {
  handleSubmit: (data: any) => void
  formData: RegisterCompanyFormData
  handleChange: (value: string, name: keyof RegisterCompanyFormData) => void
  loading: boolean
}

export default function RegisterCompanyForm({ handleSubmit, formData, handleChange, loading }: RegisterCompanyFormProps) {

  return (
    <div>
      
      {/* Conteúdo principal */}
      <div className="flex flex-1">
        {/* Coluna de formulário - 60% da largura */}
        <div className="w-full lg:w-3/5 p-8 md:p-12">
          <div className="w-full lg:w-full xl:w-3/5 p-8 md:p-12 mx-auto">

            <div className="mb-2">
              <h1 className="text-3xl font-bold mb-2">Registre Sua Empresa</h1>
              <p className="text-gray-600 mb-8">
                Preencha os campos abaixo para configurar sua empresa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange(e.target.value, 'companyName')}
                  placeholder="Digite o nome da sua empresa"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <InputMask
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={(value) => handleChange(value, 'document')}
                  mask="11.111.111/1111-11"
                  maskChar="1"
                  required
                  className="w-full"
                />
              </div>

              <TextareaWithLimit
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange(e.target.value, 'description')}
                placeholder="Descreva sua empresa brevemente"
                rows={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                label="Descrição"
                className="w-full"
              />

              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-2/5">
          <div className="h-full flex items-center justify-center p-8">
            <div className="relative max-w-md">
              <LottieAnimation
                name="business"
                height={400}
                width={400}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 