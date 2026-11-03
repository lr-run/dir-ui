// Write: today's report in one narrow column, written on a phone in two minutes. Post sits in a footer bar that
// stays at the bottom of the screen; the form locks while the report is saved, then the new report opens.
import { Controller, useForm } from 'react-hook-form'
import { Toast } from '@base-ui/react/toast'
import { Button } from '@/components/ui/button.tsx'
import { SingleCombobox } from '@/components/ui/combobox.tsx'
import { Field, FieldGroup } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import type { KitPageContext } from '@/components/systems/kit/types.ts'
import { me, memberName, moods, newestFirst, shortDate, today, values } from '@/components/systems/daily-report/data.ts'

type Form = {
  date: string
  hours: string
  project: string | null
  mood: string
  done: string
  plans: string
  blockers: string
}

export function WritePage({ store, openRecord }: KitPageContext) {
  const notifyError = useErrorNotification()
  const toasts = Toast.useToastManager()
  const mine = newestFirst(store.rows.reports!).filter((row) => values(row).author === me)
  const projects = (store.state.records.projects ?? [])
    .filter((project) => !project.archivedAt && project.values.status !== 'done')
    .map((project) => ({ value: project.id, label: project.name }))
  const lastProject = mine.map((row) => String(values(row).project)).find((id) =>
    projects.some((project) => project.value === id)
  )
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    defaultValues: {
      date: today(),
      hours: '8',
      project: lastProject ?? null,
      mood: 'good',
      done: '',
      plans: '',
      blockers: '',
    },
  })
  const locked = isSubmitting
  const text = (label: string, min: number) => (value: string) =>
    value.trim().length >= min || (value.trim() ? `Write at least ${min} characters.` : `${label} is required.`)

  return (
    <form
      noValidate
      aria-busy={locked}
      className='flex min-h-0 flex-1 flex-col'
      onSubmit={handleSubmit(async (form) => {
        try {
          // A short wait stands in for the API call; the in-memory store itself answers at once.
          await new Promise((resolve) => setTimeout(resolve, 600))
          const record = store.create('reports', `${memberName(me)} · ${shortDate(form.date)}`, {
            date: form.date,
            author: me,
            project: form.project,
            status: 'submitted',
            mood: form.mood,
            hours: Number(form.hours),
            done: form.done.trim(),
            plans: form.plans.trim(),
            blockers: form.blockers.trim(),
          })
          toasts.add({ title: 'Report posted', description: `${shortDate(form.date)} · your team can read it now` })
          openRecord('reports', record.id)
        } catch (error) {
          notifyError?.(error, 'Unable to post the report.')
        }
      })}
    >
      <div className='min-h-0 flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-[640px] p-6 max-[600px]:p-4'>
          <p className='m-0 mb-5 text-[13px] text-muted-foreground'>
            A few lines are enough. Your team reads it in the feed and your lead reviews it tomorrow morning.
          </p>
          <FieldGroup>
            <div className='grid grid-cols-2 gap-4'>
              <Controller
                control={control}
                name='date'
                rules={{
                  validate: (value) => {
                    if (!value) return 'Date is required.'
                    if (value > today()) return 'A report cannot be dated in the future.'
                    if (mine.some((row) => values(row).date === value)) {
                      return `You already posted a report for ${shortDate(value)}.`
                    }
                    return true
                  },
                }}
                render={({ field }) => (
                  <Field label='Date' required error={errors.date?.message}>
                    {(props) => (
                      <Input
                        {...props}
                        type='date'
                        max={today()}
                        disabled={locked}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    )}
                  </Field>
                )}
              />
              <Field label='Hours worked' required error={errors.hours?.message}>
                {(props) => (
                  <Input
                    {...props}
                    type='number'
                    min={0.5}
                    max={24}
                    step={0.5}
                    disabled={locked}
                    {...register('hours', {
                      validate: (value) => {
                        if (value === '') return 'Hours are required.'
                        const hours = Number(value)
                        if (!Number.isFinite(hours) || hours < 0.5 || hours > 24) return 'Enter 0.5 to 24 hours.'
                        if (hours * 2 !== Math.round(hours * 2)) return 'Use steps of half an hour.'
                        return true
                      },
                    })}
                  />
                )}
              </Field>
            </div>
            <div className='grid grid-cols-2 gap-4 max-[600px]:grid-cols-1'>
              <Controller
                control={control}
                name='project'
                rules={{ validate: (value) => !!value || 'Choose the project you spent most time on.' }}
                render={({ field }) => (
                  <Field label='Project' required error={errors.project?.message}>
                    {(props) => (
                      <SingleCombobox
                        id={props.id}
                        invalid={props.invalid}
                        label='Project'
                        items={projects}
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={locked}
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='mood'
                render={({ field }) => (
                  <Field label='Condition' description='Only your team lead sees trends.'>
                    {(props) => (
                      <Select
                        id={props.id}
                        label='Condition'
                        items={moods}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={locked}
                      />
                    )}
                  </Field>
                )}
              />
            </div>
            <Field label='What I did' required error={errors.done?.message}>
              {(props) => (
                <Textarea
                  {...props}
                  rows={4}
                  placeholder='Finished the order history screen and opened a pull request.'
                  disabled={locked}
                  {...register('done', { validate: text('What you did', 20) })}
                />
              )}
            </Field>
            <Field label='Plans for tomorrow' required error={errors.plans?.message}>
              {(props) => (
                <Textarea
                  {...props}
                  rows={3}
                  placeholder='Address review comments and start the checkout flow.'
                  disabled={locked}
                  {...register('plans', { validate: text('Plans for tomorrow', 10) })}
                />
              )}
            </Field>
            <Field
              label='Blockers'
              description='Leave empty when nothing is in your way.'
              error={errors.blockers?.message}
            >
              {(props) => (
                <Textarea
                  {...props}
                  rows={2}
                  placeholder='Waiting for staging credentials from the client.'
                  disabled={locked}
                  {...register('blockers', {
                    validate: (value) => value.length <= 500 || 'Keep blockers under 500 characters.',
                  })}
                />
              )}
            </Field>
          </FieldGroup>
        </div>
      </div>
      <div className='shrink-0 border-t border-border bg-(--ui-surface)'>
        <div className='mx-auto flex w-full max-w-[640px] items-center justify-end gap-2 px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] max-[600px]:px-4 max-[600px]:[&_[data-slot=button]]:flex-1'>
          <Button variant='default' type='submit' disabled={locked} className='min-w-[128px]'>
            {locked ? 'Posting…' : 'Post report'}
          </Button>
        </div>
      </div>
    </form>
  )
}
