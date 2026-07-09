import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import MailForm from '@/components/MailForm';
import SecurityNoticeCard from '@/components/SecurityNoticeCard';
import ResultPanel from '@/components/ResultPanel';
export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-5 hidden sm:block">
          <h1 className="text-xl font-bold text-[#1A2332]">고객 업무 메일 작성 도구</h1>
          <p className="text-sm text-[#8A94A6] mt-1">
            보안 검수를 거쳐 안전하게 메일을 작성하고, 검토 후 다양한 채널로 활용하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MailForm />
            <SecurityNoticeCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ResultPanel />
          </motion.div>
        </div>
        <footer className="mt-10 pt-6 border-t border-[#E5E8EE] text-center">
          <p className="text-xs text-[#8A94A6] leading-relaxed">
            생성된 메일은 자동 발송되지 않으며, 고객명·첨부파일명·본문 원문은 저장되지 않습니다.
          </p>
          <p className="text-xs text-[#B0B7C3] mt-1">© 2026 AI 고객 메일 작성기</p>
        </footer>
      </main>
    </div>
  );
}