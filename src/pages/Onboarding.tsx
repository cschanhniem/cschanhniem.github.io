import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Shield, Ban, DollarSign, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Onboarding() {
    const navigate = useNavigate()
    const [accepted, setAccepted] = useState(false)
    const [confirmed, setConfirmed] = useState(false)

    const handleProceed = () => {
        if (accepted && confirmed) {
            // Store acceptance in localStorage
            localStorage.setItem('codeOfConductAccepted', new Date().toISOString())
            localStorage.setItem('onboardingComplete', 'true')
            navigate('/')
        }
    }

    const threeNos = [
        {
            icon: Ban,
            title: 'KHÔNG Chính trị - Tôn giáo cực đoan',
            description: 'Chỉ tập trung vào thiền, hơi thở và chuyển hóa nội tâm'
        },
        {
            icon: DollarSign,
            title: 'KHÔNG Tiền mặt - Chèo kéo thương mại',
            description: 'Tại công viên, không quyên góp, bán hàng, rủ rê đầu tư'
        },
        {
            icon: Sparkles,
            title: 'KHÔNG Mê tín - Thần thánh hóa',
            description: 'Thiền là phương pháp rèn luyện tâm trí, không phải phép thuật'
        }
    ]

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Chào mừng đến Nhập Lưu
                    </h1>
                    <p className="text-muted-foreground">
                        Stream Entry Community
                    </p>
                </div>

                {/* Intro */}
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Trước khi tham gia cộng đồng, vui lòng đọc kỹ và cam kết tuân thủ
                        <strong className="text-foreground"> Hiến Chương Thành Viên</strong>.
                        Đây là nền tảng để bảo vệ sự an toàn và bền vững của cộng đồng.
                    </p>
                </div>

                {/* 3 NOs Summary */}
                <div className="bg-card rounded-lg border border-border p-6 mb-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                        3 Nguyên Tắc "Bất Khả Xâm Phạm"
                    </h2>
                    <div className="space-y-4">
                        {threeNos.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="p-2 bg-destructive/10 rounded-lg flex-shrink-0">
                                        <Icon className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Mantra */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 text-center">
                    <p className="text-sm italic text-foreground font-serif">
                        "Tôi là một Stream Entry Practitioner - <br />
                        <span className="text-primary font-semibold">Tỉnh thức, Kỷ luật, Tử tế."</span>
                    </p>
                </div>

                {/* Acceptance */}
                <div className="space-y-4 mb-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${accepted
                                ? 'bg-primary border-primary'
                                : 'border-border hover:border-primary/50'
                                }`}
                            onClick={() => setAccepted(!accepted)}
                        >
                            {accepted && <Check className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Tôi đã đọc và hiểu <strong className="text-foreground">Hiến Chương Thành Viên</strong>,
                            bao gồm 3 Nguyên tắc "Bất Khả Xâm Phạm" và Quy tắc Ứng xử tại Công cộng.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${confirmed
                                ? 'bg-primary border-primary'
                                : 'border-border hover:border-primary/50'
                                }`}
                            onClick={() => setConfirmed(!confirmed)}
                        >
                            {confirmed && <Check className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Tôi <strong className="text-foreground">cam kết tuân thủ</strong> và chấp nhận bị khóa tài khoản vĩnh viễn nếu vi phạm.
                        </span>
                    </label>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        className="w-full"
                        disabled={!accepted || !confirmed}
                        onClick={handleProceed}
                    >
                        Tham Gia Cộng Đồng
                    </Button>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            window.open('/quy-tac', '_blank')
                        }}
                        className="block text-center text-sm text-primary hover:underline cursor-pointer"
                    >
                        Đọc Hiến Chương đầy đủ →
                    </a>
                </div>
            </div>
        </div>
    )
}
