
import { useState } from 'react'
import {
  Moon,
  Sun,
  Download,
  Upload,
  Smartphone,
  Bell,
  Trash2,
  Minus,
  Plus,
  User,
  Target,
  Palette,
  ShieldCheck,
  Database,
  Check,
  Settings as SettingsIcon,
  Monitor,
} from 'lucide-react'

import Modal from './Modal'
import { ACCENTS, inputCls } from '../constants'

const row =
  'flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-sm font-medium text-slate-700 transition hover:border-accent-300 hover:bg-slate-50 active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60'

const sectionTitle =
  'mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400'

function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className={sectionTitle}>
        <Icon size={15} />
        {title}
      </h3>
      {children}
    </section>
  )
}

function InfoCard({ icon: Icon, title, description, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${color}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function Settings({
  theme,
  toggleTheme,
  accent,
  setAccent,
  name,
  setName,
  goal,
  setGoal,
  canInstall,
  install,
  onExport,
  onImport,
  onReset,
  onClose,
}) {
  const [perm, setPerm] = useState(
    'Notification' in window
      ? Notification.permission
      : 'unsupported'
  )

  const askPermission = async () => {
    if (!('Notification' in window)) return

    try {
      const result = await Notification.requestPermission()
      setPerm(result)
    } catch {
      setPerm('denied')
    }
  }

  const colors = Object.entries(ACCENTS)

  return (
    <Modal title="Settings & Preferences" onClose={onClose}>
      <div className="space-y-7">

        {/* Welcome card */}
        <div className="rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
              <SettingsIcon size={24} />
            </div>
            <div>
              <p className="text-lg font-bold">Personalize TaskFlow</p>
              <p className="text-sm text-white/75">
                Make your workspace feel like yours.
              </p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <Section icon={User} title="Profile">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Your display name
            </label>

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              maxLength={40}
              className={inputCls}
            />

            <p className="mt-2 text-xs text-slate-400">
              Your name is used in your dashboard greeting.
            </p>
          </div>
        </Section>

        {/* Daily goal */}
        <Section icon={Target} title="Daily productivity goal">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Tasks per day
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Set your daily completion target.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGoal(Math.max(1, goal - 1))}
                  disabled={goal <= 1}
                  aria-label="Decrease daily goal"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Minus size={16} />
                </button>

                <span className="w-7 text-center text-xl font-bold text-slate-900 dark:text-white">
                  {goal}
                </span>

                <button
                  onClick={() => setGoal(Math.min(30, goal + 1))}
                  disabled={goal >= 30}
                  aria-label="Increase daily goal"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Minimum: 1 task</span>
              <span>Maximum: 30 tasks</span>
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          <div className="space-y-3">

            <button
              onClick={toggleTheme}
              className={row}
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
                {theme === 'dark' ? (
                  <Sun size={20} />
                ) : (
                  <Moon size={20} />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </p>
                <p className="mt-0.5 text-xs font-normal text-slate-400">
                  {theme === 'dark'
                    ? 'Switch to a brighter appearance'
                    : 'Switch to a darker appearance'}
                </p>
              </div>

              <Monitor size={18} className="text-slate-400" />
            </button>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Accent color
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Choose your preferred app color.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {colors.map(([key, hex]) => (
                  <button
                    key={key}
                    onClick={() => setAccent(key)}
                    aria-label={`Select ${key} accent`}
                    aria-pressed={accent === key}
                    title={key}
                    style={{ backgroundColor: hex }}
                    className={`grid h-10 w-10 place-items-center rounded-full transition hover:scale-110 ${
                      accent === key
                        ? 'scale-110 ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900'
                        : ''
                    }`}
                  >
                    {accent === key && (
                      <Check size={18} className="text-white" />
                    )}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs capitalize text-slate-500 dark:text-slate-400">
                Selected color: {accent}
              </p>
            </div>
          </div>
        </Section>

        {/* Notifications and installation */}
        <Section icon={Bell} title="App preferences">
          <div className="space-y-2">

            {perm !== 'unsupported' && (
              <div className={row}>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Bell size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Browser notifications</p>
                  <p className="mt-1 text-xs font-normal text-slate-400">
                    {perm === 'granted'
                      ? 'Notifications are enabled'
                      : perm === 'denied'
                        ? 'Blocked in browser settings'
                        : 'Get alerts when focus sessions finish'}
                  </p>
                </div>

                {perm === 'granted' ? (
                  <span className="text-xs font-semibold text-emerald-500">
                    Enabled
                  </span>
                ) : perm === 'denied' ? (
                  <span className="text-xs text-rose-500">
                    Blocked
                  </span>
                ) : (
                  <button
                    onClick={askPermission}
                    className="rounded-xl bg-accent-600 px-3 py-2 text-xs font-semibold text-white hover:bg-accent-700"
                  >
                    Enable
                  </button>
                )}
              </div>
            )}

            {canInstall && (
              <button
                onClick={() => {
                  install()
                  onClose?.()
                }}
                className={row}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Smartphone size={19} />
                </div>

                <div className="flex-1">
                  <p className="font-semibold">Install TaskFlow</p>
                  <p className="mt-1 text-xs font-normal text-slate-400">
                    Add the app to your device.
                  </p>
                </div>
              </button>
            )}
          </div>
        </Section>

        {/* Backup */}
        <Section icon={Database} title="Your data & backup">
          <div className="space-y-2">

            <InfoCard
              icon={ShieldCheck}
              title="Your data stays in your browser"
              description="Export a backup to keep a separate copy."
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />

            <button onClick={onExport} className={row}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Download size={19} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">Export backup</p>
                <p className="mt-1 text-xs font-normal text-slate-400">
                  Download your tasks, notes and settings.
                </p>
              </div>
            </button>

            <button onClick={onImport} className={row}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <Upload size={19} />
              </div>

              <div className="flex-1">
                <p className="font-semibold">Import backup</p>
                <p className="mt-1 text-xs font-normal text-slate-400">
                  Restore data from a backup file.
                </p>
              </div>
            </button>
          </div>
        </Section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 size={17} className="text-rose-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Danger zone
            </h3>
          </div>

          <p className="mb-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
            This action deletes your saved app data. Export a backup before
            proceeding if you want to keep a copy.
          </p>

          <button
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:hover:bg-rose-900/40"
          >
            <Trash2 size={17} />
            Delete all data
          </button>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            TaskFlow
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Plan better. Focus deeper. Get more done.
          </p>
        </div>

      </div>
    </Modal>
  )
}
