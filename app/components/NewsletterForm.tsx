import {useFetcher, Form, useNavigation} from '@remix-run/react';
import {useEffect, useRef, useState} from 'react';

interface NewsletterFormProps {
  action?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export function NewsletterForm({
  action = '/api/newsletter',
  title = '最新情報を購読',
  description = '新作フィギュアの発売情報や限定予約のお知らせをいち早くメールでお届けします',
  placeholder = 'メールアドレスを入力',
  buttonText = '購読',
}: NewsletterFormProps) {
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    message?: string;
  }>();
  const formRef = useRef<HTMLFormElement>(null);
  const isLoading = fetcher.state !== 'idle';
  const isSuccess = fetcher.data?.success;

  useEffect(() => {
    if (isSuccess) {
      formRef.current?.reset();
    }
  }, [isSuccess]);

  return (
    <section className="py-20 bg-[#fafaf9] border-y border-[#e7e5e4]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
          {title}
        </h3>
        <p className="text-[#a8a29e] mb-10 font-light">{description}</p>

        <fetcher.Form
          ref={formRef}
          method="POST"
          action={action}
          className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
        >
          <input
            type="email"
            name="email"
            placeholder={placeholder}
            className="flex-1 px-6 py-4 bg-white border border-[#e7e5e4] placeholder-[#a8a29e] focus:outline-none focus:border-[#78716c] transition-colors text-sm rounded-sm"
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-[rgb(var(--apex-text))] text-white font-medium tracking-wider uppercase text-sm hover:bg-[#78716c] transition-colors rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? '送信中...' : buttonText}
          </button>
        </fetcher.Form>

        {isSuccess && fetcher.data?.message && (
          <p className="text-green-600 mt-4 text-sm">
            ✓ {fetcher.data.message}
          </p>
        )}

        {fetcher.data?.error && (
          <p className="text-red-600 mt-4 text-sm">✕ {fetcher.data.error}</p>
        )}

        <p className="text-[#a8a29e] text-xs mt-4">
          購読解除はいつでも可能です
        </p>
      </div>
    </section>
  );
}
