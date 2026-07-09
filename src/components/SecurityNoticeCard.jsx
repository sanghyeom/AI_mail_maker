import { AlertCircle, X, Check } from 'lucide-react';
const FORBIDDEN_ITEMS = ['계좌번호', '주민등록번호', '거래금액', '구체적 수익률', '고객 연락처'];
export default function SecurityNoticeCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E8EE] shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2563EB] text-white text-sm font-bold tabular-nums">
          02
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#1A2332]">보안 유의사항</h2>
          <p className="text-xs text-[#8A94A6]">AI 호출 전 아래 정보는 자동 차단됩니다</p>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] mb-4">
        <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#991B1B] leading-relaxed">
          다음 항목은 절대 입력하지 마세요. 감지 시 메일이 생성되지 않습니다.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FORBIDDEN_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-[#1A2332]">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center">
              <X className="w-3 h-3 text-[#DC2626]" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-[#E5E8EE] flex items-start gap-2">
        <Check className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#8A94A6] leading-relaxed">
          AI 생성 결과는 자동으로 발송되지 않습니다. 반드시 내용을 검토한 후 사용하시고,
          발송에 대한 최종 책임은 사용자에게 있습니다.
        </p>
      </div>
    </div>
  );
}