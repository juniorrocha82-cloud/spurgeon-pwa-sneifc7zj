import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, ClipboardList, Clock, Send, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { submitContactMessage } from '@/services/contact'
import { useToast } from '@/hooks/use-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres.'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres.'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    if (!user) return
    setIsSubmitting(true)

    try {
      const { error } = await submitContactMessage(values, user.id)
      if (error) throw error

      setIsSuccess(true)
      toast({
        title: 'Mensagem enviada!',
        description: 'Recebemos seu contato e retornaremos em breve.',
      })
      form.reset()

      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error(error)
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Ocorreu um problema ao enviar sua mensagem. Tente novamente mais tarde.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="w-full max-w-4xl mx-auto animate-fade-in-up pb-12"
      aria-labelledby="contact-title"
    >
      {/* Header Banner */}
      <header className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center mb-8 shadow-md">
        <h1 id="contact-title" className="font-serif text-3xl md:text-5xl font-bold mb-4">
          Queremos Ouvir Você
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto">
          Tem dúvidas sobre o Spurgeon? Quer sugerir uma funcionalidade? Encontrou um problema?
          Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo:
        </p>
      </header>

      <div className="space-y-6 px-2 md:px-0">
        <Card className="border-border/50 shadow-sm overflow-hidden" as="article">
          <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
            <CardTitle
              className="flex items-center text-xl font-serif text-primary"
              id="email-contact-title"
            >
              <Mail className="w-5 h-5 mr-3 text-primary" aria-hidden="true" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6" aria-labelledby="email-contact-title">
            <p className="text-muted-foreground mb-2">
              Para dúvidas gerais, sugestões ou suporte técnico, envie um email para:
            </p>
            <a
              href="mailto:faleconosco@spurgeon.one"
              className="text-primary font-medium hover:underline text-lg inline-flex items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none rounded-sm"
              aria-label="Enviar email para faleconosco@spurgeon.one"
            >
              faleconosco@spurgeon.one
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Responderemos sua mensagem em até 24 horas úteis.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden" as="article">
          <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
            <CardTitle
              className="flex items-center text-xl font-serif text-primary"
              id="form-contact-title"
            >
              <ClipboardList className="w-5 h-5 mr-3 text-primary" aria-hidden="true" />
              Formulário de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                aria-labelledby="form-contact-title"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome"
                            aria-required="true"
                            aria-invalid={!!form.formState.errors.name}
                            className="focus-visible:ring-primary focus-visible:outline-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu@email.com"
                            type="email"
                            aria-required="true"
                            aria-invalid={!!form.formState.errors.email}
                            className="focus-visible:ring-primary focus-visible:outline-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage aria-live="polite" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Assunto da mensagem"
                          aria-required="true"
                          aria-invalid={!!form.formState.errors.subject}
                          className="focus-visible:ring-primary focus-visible:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escreva sua mensagem..."
                          className="min-h-[120px] resize-y focus-visible:ring-primary focus-visible:outline-none"
                          aria-required="true"
                          aria-invalid={!!form.formState.errors.message}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage aria-live="polite" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full md:w-auto min-w-[200px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  disabled={isSubmitting || isSuccess}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center animate-pulse" aria-live="polite">
                      Enviando...
                    </span>
                  ) : isSuccess ? (
                    <span className="flex items-center" aria-live="polite">
                      <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" /> Enviado com
                      sucesso
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="w-4 h-4 mr-2" aria-hidden="true" /> Enviar Mensagem
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden" as="article">
          <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
            <CardTitle
              className="flex items-center text-xl font-serif text-primary"
              id="hours-contact-title"
            >
              <Clock className="w-5 h-5 mr-3 text-primary" aria-hidden="true" />
              Horário de Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3" aria-labelledby="hours-contact-title">
            <p className="text-foreground">
              <strong className="font-medium">Segunda a Sexta:</strong>{' '}
              <span className="text-muted-foreground">9h às 18h (Horário de Brasília)</span>
            </p>
            <p className="text-foreground">
              <strong className="font-medium">Sábado e Domingo:</strong>{' '}
              <span className="text-muted-foreground">
                Respostas automáticas (respondemos na segunda-feira)
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
