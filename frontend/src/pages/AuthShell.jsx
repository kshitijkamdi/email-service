import { Mail } from 'lucide-react';

const AuthShell = ({ title, subtitle, children }) => (
  <div className="grid min-h-screen bg-paper lg:grid-cols-[0.95fr_1.05fr]">
    <section className="hidden border-r border-line bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-white">
          <Mail size={22} />
        </div>
        <span className="text-lg font-semibold">MiniMail</span>
      </div>
      <div>
        <h1 className="max-w-xl text-5xl font-semibold tracking-normal text-ink">Email under your own domain.</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-500">
          Private accounts, webhook-delivered inboxes, and a clean dashboard for teams using Resend.
        </p>
      </div>
      <p className="text-sm text-slate-400">Powered by Express, MongoDB, React, and Resend.</p>
    </section>

    <main className="flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
            <Mail size={20} />
          </div>
          <span className="text-lg font-semibold">MiniMail</span>
        </div>
        <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-line sm:p-8">
          <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  </div>
);

export default AuthShell;
